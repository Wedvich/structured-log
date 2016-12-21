/// <reference path="../node_modules/@types/mocha/index.d.ts" />

import { expect } from 'chai';
import MessageTemplate from '../src/messageTemplate';

describe('MessageTemplate', () => {
  describe('bindProperties()', () => {
    it('binds properties from arguments', () => {
      let boundProperties;
      ((...properties: any[]) => {
        const messageTemplate = new MessageTemplate('Happy {age}th birthday, {name}!');
        boundProperties = messageTemplate.bindProperties(properties);
      })(30, 'Fred');
      expect(boundProperties).to.have.property('age', 30);
      expect(boundProperties).to.have.property('name', 'Fred');
    });

    it('destructures bound properties from arguments', () => {
      let boundProperties;
      ((...properties: any[]) => {
        const messageTemplate = new MessageTemplate('Hello, {@person}!');
        boundProperties = messageTemplate.bindProperties(properties);
      })({ firstName: 'Leeroy', lastName: 'Jenkins' });
      expect(boundProperties).to.have.deep.property('person.firstName', 'Leeroy');
      expect(boundProperties).to.have.deep.property('person.lastName', 'Jenkins');
    });
  });
  describe('render()', () => {
    it('renders message', () => {
      const messageTemplate = new MessageTemplate('Happy {age}th birthday, {name}!');
      const message = messageTemplate.render({ age: 30, name: 'Fred' });

      expect(message).to.equal('Happy 30th birthday, Fred!');
    });

    it('renders message without any parameters', () => {
      const messageTemplate = new MessageTemplate('Happy 30th birthday, Fred!');
      const message = messageTemplate.render();

      expect(message).to.equal('Happy 30th birthday, Fred!');
    });

    it('renders message with destructured parameters', () => {
      const messageTemplate = new MessageTemplate('Hello, {@person}!');
      const message = messageTemplate.render({ person: { firstName: 'Leeroy', lastName: 'Jenkins' } });

      expect(message).to.equal('Hello, {"firstName":"Leeroy","lastName":"Jenkins"}!');
    });
  });
});
