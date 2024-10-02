// let person2 = {
//     name: "Alice",
//     age: "30",
//     greet: function ()  {
//         console.log("Hello I'm ${this.name}");
//     },
// };

// let car = new Object();
// car.make = "Toyota";
// car.model = "Corolla";

// console.log(person2.name);
// console.log(person2["age"]);

// let propertyName = "name";
// console.log(person2[propertyName]);

// person2.greet();

// let calculator = {
//     add(a,b) {
//         return a+b;
//     },
// };

// console.log(calculator.add(5,3));

// let animal = {
//     makeSound: function () {
//         console.log("Some generic sound");
//     },
// };

// let dog = Object.create(animal);
// dog.makeSound();

// class Animal {
//     constructor(name) {
//         this.name = name;
//     };

//     speak() {
//         console.log('${this.name} makes a sound');
//     }
// }

// class Dog extends Animal {
//     speakk() {
//         console.log(`${this.name} barks`);
//     }
// }

// const rover = new Dog("Rover");

// rover.speak();

// for (let attribute in person2) {
//     console.log("for in objects returns key: " + attribute);
// }

// const fetchData = () => {
//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             resolve("Data fetch success");
//         }, 2000);
//     });
// }

// fetchData().then(data => console.log(data)).catch(error => console.log(error));

// const getData = async() => {
//     try {
//         const result = await fetchData();
//         console.log(result);
//     } catch (error) {
//         console.log(error);
//     }
// }

// const book1 = {
//     title: "Harry Potter",
//     author: "J.K. Rowling",
//     genre: "Fantasy",
//     edition: 1,
//     published: 1997,
// };

// let bookTitle = `<h2>${book1.title}</h2>`;

// console.log(book1);
// console.log(book1.author);

// document.querySelector(".container")
// .insertAdjacentHTML("beforeend", bookTitle);

// const book = function(title, author, genre, edition, published) {
//     this.title = title;
//     this.author = author;
//     this.genre  = genre;
//     this.edition = edition;
//     this.published = published;
// };

// const book2 = new book("Harry Potter 2", "J.K. Rowling", "Fantasy", 1, "2000");

// console.log(book2);
// console.log(book2.published);

// let bookPublish = `<h2>Book Title</h2><p>${book2.title}</p><h2>Author</h2><p>${book2.author}</p>`;

// document.querySelector(".container").insertAdjacentHTML("beforeend",bookPublish);

// const book3 = new Object();

// book3.title = "Harry Potter 3";
// book3.author = "J.K. Rowling";
// book3.genre = "Fantasy";
// book3.edition = 2;
// book3.published = "2003";

// let bookAuthor = `<h2>${book3.author}</h2>`;

// document.querySelector(".container").insertAdjacentHTML("beforeend", bookAuthor);

