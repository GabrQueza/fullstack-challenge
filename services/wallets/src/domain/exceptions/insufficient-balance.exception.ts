export class InsufficientBalanceException extends Error {
  constructor(message = 'Insufficient balance in wallet') {
    super(message);
    this.name = 'InsufficientBalanceException';
  }
}
