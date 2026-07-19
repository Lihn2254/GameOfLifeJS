export class CellOutOfBoundsException extends RangeError {
  constructor(message = 'Cell is out of bounds for this grid') {
    super(message)
    this.name = 'CellOutOfBoundsException'
  }
}