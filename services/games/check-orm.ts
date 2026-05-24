import { MikroORM } from '@mikro-orm/core';

const descriptor = Object.getOwnPropertyDescriptor(MikroORM.prototype, 'schema');
console.log('schema descriptor:', descriptor);
console.log('Is getter:', !!descriptor?.get);
