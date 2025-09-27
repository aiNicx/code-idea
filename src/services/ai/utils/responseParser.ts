/**
 * Response Parser - Sistema per il parsing e validazione delle risposte API
 * Gestisce formati JSON, markdown e errori di parsing
 */

export interface ParsedResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    format: 'json' | 'markdown' | 'text';
    hasCodeBlocks: boolean;
    confidence: number;
  };
}

/**
 * Parser principale per le risposte API
 */
export class ResponseParser {
  /**
   * Parsa una risposta generica dall'API
   */
  parse<T = any>(response: string, expectedFormat: 'json' | 'markdown' | 'text' = 'text'): ParsedResponse<T> {
    if (!response || typeof response !== 'string') {
      return {
        success: false,
        error: 'Invalid response: empty or not a string'
      };
    }

    const trimmedResponse = response.trim();

    // Se è atteso JSON, prova prima a parsarlo direttamente
    if (expectedFormat === 'json') {
      const jsonResult = this.tryParseJson<T>(trimmedResponse);
      if (jsonResult.success) {
        return jsonResult;
      }

      // Se il parsing diretto fallisce, prova a estrarre da code blocks
      const extractedResult = this.extractFromCodeBlocks<T>(trimmedResponse);
      if (extractedResult.success) {
        return extractedResult;
      }

      return {
        success: false,
        error: `Expected JSON but got: ${jsonResult.error || 'Unable to extract JSON from response'}`
      };
    }

    // Per markdown o text, restituisci il contenuto
    return {
      success: true,
      data: trimmedResponse as T,
      metadata: {
        format: this.detectFormat(trimmedResponse),
        hasCodeBlocks: this.hasCodeBlocks(trimmedResponse),
        confidence: 0.9
      }
    };
  }

  /**
   * Tenta di parsare una stringa come JSON
   */
  private tryParseJson<T>(text: string): ParsedResponse<T> {
    try {
      const parsed = JSON.parse(text);
      return {
        success: true,
        data: parsed,
        metadata: {
          format: 'json',
          hasCodeBlocks: false,
          confidence: 1.0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Estrae JSON da markdown code blocks
   */
  private extractFromCodeBlocks<T>(text: string): ParsedResponse<T> {
    // Cerca code blocks con ```json
    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
    const matches = [...text.matchAll(jsonBlockRegex)];

    if (matches.length === 0) {
      return {
        success: false,
        error: 'No JSON code blocks found in response'
      };
    }

    // Prova a parsare il primo match
    const jsonContent = matches[0][1];
    return this.tryParseJson<T>(jsonContent);
  }

  /**
   * Rileva il formato del contenuto
   */
  private detectFormat(text: string): 'json' | 'markdown' | 'text' {
    const trimmed = text.trim();

    // Check for JSON indicators
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        JSON.parse(trimmed);
        return 'json';
      } catch {
        // Non è JSON valido, continua
      }
    }

    // Check for markdown indicators
    if (trimmed.includes('#') || trimmed.includes('**') || trimmed.includes('*') ||
        trimmed.includes('```') || trimmed.match(/^\d+\./m)) {
      return 'markdown';
    }

    return 'text';
  }

  /**
   * Verifica se il testo contiene code blocks
   */
  private hasCodeBlocks(text: string): boolean {
    return /```[\s\S]*?```/.test(text);
  }

  /**
   * Sanitizza una risposta rimuovendo caratteri problematici
   */
  sanitize(text: string): string {
    return text
      .replace(/\x00/g, '') // Remove null bytes
      .replace(/\uFFFD/g, '') // Remove replacement characters
      .trim();
  }

  /**
   * Estrae metadati da una risposta
   */
  extractMetadata(response: string): {
    wordCount: number;
    lineCount: number;
    hasHeaders: boolean;
    hasLists: boolean;
    hasCode: boolean;
  } {
    const lines = response.split('\n');
    const words = response.split(/\s+/).filter(w => w.length > 0);

    return {
      wordCount: words.length,
      lineCount: lines.length,
      hasHeaders: /#{1,6}\s/.test(response),
      hasLists: /^\s*[-*+]\s|^\s*\d+\.\s/.test(response),
      hasCode: /`[^`]+`/.test(response)
    };
  }
}

/**
 * Validatore specializzato per risposte strutturate
 */
export class StructuredResponseValidator {
  /**
   * Valida una risposta JSON contro uno schema
   */
  validateJson<T>(data: any, schema: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data || typeof data !== 'object') {
      errors.push('Response must be an object');
      return { isValid: false, errors };
    }

    // Validazione base dello schema
    this.validateSchema(data, schema, '', errors);

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateSchema(data: any, schema: any, path: string, errors: string[]): void {
    if (!schema || typeof schema !== 'object') return;

    // Verifica tipo richiesto
    if (schema.type) {
      const expectedType = this.getTypeFromSchema(schema.type);
      if (expectedType && typeof data !== expectedType) {
        errors.push(`${path}: Expected ${expectedType}, got ${typeof data}`);
      }
    }

    // Verifica proprietà richieste
    if (schema.required && Array.isArray(schema.required)) {
      for (const prop of schema.required) {
        if (!(prop in data)) {
          errors.push(`${path}: Missing required property '${prop}'`);
        }
      }
    }

    // Verifica proprietà aggiuntive se strict
    if (schema.additionalProperties === false && schema.properties) {
      const allowedProps = Object.keys(schema.properties);
      for (const prop in data) {
        if (!allowedProps.includes(prop)) {
          errors.push(`${path}: Unexpected property '${prop}'`);
        }
      }
    }
  }

  private getTypeFromSchema(schemaType: string): string | null {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'array': 'object',
      'object': 'object'
    };

    return typeMap[schemaType] || null;
  }
}

/**
 * Formatter per diversi tipi di output
 */
export class ResponseFormatter {
  /**
   * Formatta una risposta JSON in markdown
   */
  formatJsonAsMarkdown(data: any, title?: string): string {
    const jsonString = JSON.stringify(data, null, 2);
    const header = title ? `# ${title}\n\n` : '';

    return `${header}\`\`\`json\n${jsonString}\n\`\`\``;
  }

  /**
   * Formatta un errore in formato leggibile
   */
  formatError(error: string, context?: string): string {
    const contextInfo = context ? `**Context:** ${context}\n\n` : '';
    return `❌ **Error:** ${error}\n\n${contextInfo}`;
  }

  /**
   * Formatta metadati di una risposta
   */
  formatMetadata(metadata: any): string {
    return `**Metadata:**
- Word Count: ${metadata.wordCount}
- Line Count: ${metadata.lineCount}
- Headers: ${metadata.hasHeaders ? 'Yes' : 'No'}
- Lists: ${metadata.hasLists ? 'Yes' : 'No'}
- Code: ${metadata.hasCode ? 'Yes' : 'No'}`;
  }
}

// Istanze singleton
export const responseParser = new ResponseParser();
export const responseValidator = new StructuredResponseValidator();
export const responseFormatter = new ResponseFormatter();