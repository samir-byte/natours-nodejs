// Used as a wrapper function where the function that was called is stored inside an anonymous function and means we only have a single catch block for all methods on tourController.
module.exports = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
