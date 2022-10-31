// Format options string
const formatOptions = (options) => {
  let optionsArr = options.split(",");
  let result = optionsArr.map(option => {
    return {
      value: option,
      votes: 0
    };
  });
  return result;
};

module.exports = { formatOptions };