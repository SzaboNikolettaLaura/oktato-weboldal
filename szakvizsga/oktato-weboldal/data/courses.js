export default [
  {
    "courseTitle": "Web Development Fundamentals",
    "lectures": [
      {
        "title": "Introduction to Web Development",
        "content": "In this lecture, we will cover the basics of web development. We will learn about the structure of a webpage and how HTML, CSS, and JavaScript come together to build a website. @{exercise1}",
        "exercises": [
          {
            "exerciseId": "exercise1",
            "description": "Create a simple HTML page with a title and a paragraph.",
            "code": "<html>\n\t<head>\n\t\t<title>Simple HTML Page</title>\n\t</head>\n\t<body>\n\t\t<h1>hello</h1>\n\t\t<p>This is a simple HTML page.</p>\n\t</body>\n</html>"
          }
        ]
      },
      {
        "title": "HTML Basics",
        "content": "HTML (Hypertext Markup Language) is the foundation of any webpage. In this lecture, we will explore HTML tags, elements, and attributes. You will learn how to structure a page using tags like <code>&lt;div&gt;</code>, <code>&lt;header&gt;</code>, and <code>&lt;footer&gt;</code>. @{exercise2}",
        "exercises": [
          {
            "exerciseId": "exercise2",
            "description": "Build a basic webpage structure with a header, footer, and content section.",
            "code": "<html>\n\t<head>\n\t\t<title>Basic Webpage</title>\n\t</head>\n\t<body>\n\t\t<header>\n\t\t\t<h1>My Webpage</h1>\n\t\t</header>\n\t\t<main>\n\t\t\t<p>Welcome to my webpage.</p>\n\t\t</main>\n\t\t<footer>\n\t\t\t<p>Footer content</p>\n\t\t</footer>\n\t</body>\n</html>"
          }
        ]
      }
    ]
  },
  {
    "courseTitle": "JavaScript Fundamentals",
    "lectures": [
      {
        "title": "Introduction to JavaScript",
        "content": "JavaScript is a programming language that allows you to make websites interactive. In this lecture, we will go over how to create variables, work with data types, and perform simple calculations. @{exercise3}",
        "exercises": [
          {
            "exerciseId": "exercise3",
            "description": "Write a JavaScript function that adds two numbers and logs the result.",
            "code": "function addNumbers(a, b) {\n\treturn a + b;\n}\n\nconsole.log(addNumbers(5, 10));"
          }
        ]
      },
      {
        "title": "Functions in JavaScript",
        "content": "Functions allow us to reuse code in JavaScript. In this lecture, we will learn how to define a function, pass parameters, and return values. @{exercise4}",
        "exercises": [
          {
            "exerciseId": "exercise4",
            "description": "Create a function that takes a name as an argument and returns a greeting message.",
            "code": "function greet(name) {\n\treturn 'Hello, ' + name + '!';\n}\n\nconsole.log(greet('Alice'));"
          }
        ]
      }
    ]
  },
  {
    "courseTitle": "CSS Fundamentals",
    "lectures": [
      {
        "title": "Introduction to CSS",
        "content": "CSS (Cascading Style Sheets) is used to style and lay out web pages. In this lecture, we will learn how to apply styles using selectors, properties, and values. @{exercise5}",
        "exercises": [
          {
            "exerciseId": "exercise5",
            "description": "Style a webpage by changing the background color and text color.",
            "code": "body {\n\tbackground-color: lightblue;\n\tcolor: darkblue;\n}\n\nh1 {\n\tcolor: red;\n}"
          }
        ]
      },
      {
        "title": "CSS Layout and Flexbox",
        "content": "Flexbox is a CSS layout module that makes it easier to design responsive layouts. In this lecture, we'll learn about flex containers, flex items, and how to align elements. @{exercise6}",
        "exercises": [
          {
            "exerciseId": "exercise6",
            "description": "Create a simple webpage layout with a navigation bar using Flexbox.",
            "code": "<html>\n\t<head>\n\t\t<title>Flexbox Layout</title>\n\t\t<style>\n\t\t\tbody {\n\t\t\t\tfont-family: Arial, sans-serif;\n\t\t\t}\n\t\t\tnav {\n\t\t\t\tdisplay: flex;\n\t\t\t\tbackground-color: #333;\n\t\t\t}\n\t\t\tnav a {\n\t\t\t\tcolor: white;\n\t\t\t\tpadding: 14px 20px;\n\t\t\t\ttext-decoration: none;\n\t\t\t}\n\t\t\tnav a:hover {\n\t\t\t\tbackground-color: #ddd;\n\t\t\t\tcolor: black;\n\t\t\t}\n\t\t</style>\n\t</head>\n\t<body>\n\t\t<nav>\n\t\t\t<a href=\"#\">Home</a>\n\t\t\t<a href=\"#\">About</a>\n\t\t\t<a href=\"#\">Contact</a>\n\t\t</nav>\n\t\t<main>\n\t\t\t<p>Welcome to the Flexbox layout example!</p>\n\t\t</main>\n\t</body>\n</html>"
          }
        ]
      }
    ]
  }
];
