export default (text = "Hello world") => {
    const element = document.createElement("button");

    element.className = "pure-button";
    element.innerHTML = text;

    return element;
};