const tokenizer = /\{@?\w+}/g;

interface Token {
  name?: string;
  text?: string;
  destructure?: boolean;
  raw?: string;
}

export default class MessageTemplate {
  private template: string;
  private tokens: Token[];
  private properties: Object;

  constructor(messageTemplate: string, ...properties: any[]) {
    this.template = messageTemplate;
    this.tokens = this.tokenize(messageTemplate);
    this.properties = Object.assign({}, properties);
  }

  public render(properties?: Object): string {
    if (!this.tokens.length) {
      return this.template;
    }
    const result = [];
    for (var i = 0; i < this.tokens.length; ++i) {
      const token = this.tokens[i];
      if (typeof token.name === 'string') {
        if (properties.hasOwnProperty(token.name)) {
          result.push(this.toText(properties[token.name]));
        } else {
          result.push(token.raw);
        }
      } else {
        result.push(token.text);
      }
    }
    return result.join('');
  }

  public enrichWith(properties) {
    Object.assign(this.properties, properties);
  }

  public bindProperties(positionalArgs): Object {
    const result = {};
    let nextArg = 0;
    for (var i = 0; i < this.tokens.length && nextArg < positionalArgs.length; ++i) {
      const token = this.tokens[i];
      if (typeof token.name === 'string') {
        let p = positionalArgs[nextArg];
        result[token.name] = this.capture(p, token.destructure);
        nextArg++;
      }
    }

    while (nextArg < positionalArgs.length) {
      const arg = positionalArgs[nextArg];
      if (typeof arg !== 'undefined') {
        result['a' + nextArg] = this.capture(arg);
      }
      nextArg++;
    }

    return result;
  }

  private tokenize(template: string): Token[] {
    const tokens = [];

    let result;
    let textStart;

    while ((result = tokenizer.exec(template)) !== null) {
      if (result.index !== textStart) {
        tokens.push({ text: template.slice(textStart, result.index) });
      }

      let destructure = false;

      let token = result[0].slice(1, -1);
      if (token.indexOf('@') === 0) {
        token = token.slice(1);
        destructure = true;
      }

      tokens.push({
        name: token,
        destructure,
        raw: result[0]
      });

      textStart = tokenizer.lastIndex;
    }

    if (textStart >= 0 && textStart < template.length) {
      tokens.push({ text: template.slice(textStart) });
    }

    return tokens;
  }

  private toText(property: any): string {
    if (typeof property === 'undefined') {
      return 'undefined';
    }

    if (property === null) {
      return 'null';
    }

    if (typeof property === 'string') {
      return property;
    }

    if (typeof property === 'number') {
      return property.toString();
    }

    if (typeof property === 'boolean') {
      return property.toString();
    }

    if (typeof property.toISOString === 'function') {
      return property.toISOString();
    }

    if (typeof property === 'object') {
      let s = JSON.stringify(property);
      if (s.length > 70) {
        s = s.slice(0, 67) + '...';
      }

      return s;
    }

    return property.toString();
  };

  private capture(property: any, destructure?: boolean): Object {
    if (typeof property === 'function') {
      return property.toString();
    }

    if (typeof property === 'object') {
      // null value will be automatically stringified as "null", in properties it will be as null
      // otherwise it will throw an error
      if (property === null) {
        return property;
      }

      // Could use instanceof Date, but this way will be kinder
      // to values passed from other contexts...
      if (destructure || typeof property.toISOString === 'function') {
        return property;
      }

      return property.toString();
    }

    return property;
  }
}
