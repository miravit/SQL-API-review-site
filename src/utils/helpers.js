// Function to select specified properties from objects when using a map loop
function selectProps(...props) {
  return function (obj) {
    const newObj = {};
    props.forEach((name) => {
      newObj[name] = obj[name];
    });

    return newObj;
  };
}

module.exports = {
  selectProps,
};
