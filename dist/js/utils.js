// Vector3.js
export default class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  
    // Método para adição
    add(vector) {
      return new Vector3(this.x + vector.x, this.y + vector.y, this.z + vector.z);
    }
  
    // Método para subtração
    subtract(vector) {
      return new Vector3(this.x - vector.x, this.y - vector.y, this.z - vector.z);
    }
  
    // Método para multiplicação por um escalar
    multiply(scalar) {
      return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }
  
    // Método para obter a magnitude do vetor
    magnitude() {
      return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }
  
    // Método para normalizar o vetor
    normalize() {
      const mag = this.magnitude();
      return new Vector3(this.x / mag, this.y / mag, this.z / mag);
    }
  }
  