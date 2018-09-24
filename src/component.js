export default (text = process.env.HELLO) => {
    const element = document.createElement("button");

    // element.className = "pure-button";
    element.innerHTML = text + 'whatt';

    element.onclick = () => {
        import("./lazy")
        .then(lazy => {
            element.textContent = lazy.default;
        })
        .catch(err => {
            console.error(err);
        });
    }
    

    return element;
};