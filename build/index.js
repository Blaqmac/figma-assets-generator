"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFigmaAssets = void 0;

var _fs = _interopRequireDefault(require("fs"));

var Figma = _interopRequireWildcard(require("figma-js"));

var _listr = _interopRequireDefault(require("listr"));

var _saveImageToFs = require("./helpers/saveImageToFs");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

require("@babel/polyfill");

require("dotenv").config();

var CONFIG_FILENAME = "figma-assets-generator.json";

var getFigmaAssets =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee3(options) {
    var config, _ref2, fileId, documentId, fileExtension, personalAccessToken, output, client, itemDocument, items, itemsWithUrls, getFileInfo, getItemsFromFrames, getImageURLs, saveImages, taskItems, tasks;

    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return JSON.parse(_fs.default.readFileSync(CONFIG_FILENAME, "utf-8"));

          case 3:
            config = _context3.sent;
            _ref2 = options || config, fileId = _ref2.fileId, documentId = _ref2.documentId, fileExtension = _ref2.fileExtension, personalAccessToken = _ref2.personalAccessToken, output = _ref2.output;
            output = output || "assets";
            fileExtension = fileExtension || "svg";
            personalAccessToken = personalAccessToken || process.env.FIGMA_TOKEN;

            if (personalAccessToken) {
              _context3.next = 10;
              break;
            }

            throw new Error("No token specified!");

          case 10:
            if (fileId) {
              _context3.next = 12;
              break;
            }

            throw new Error("No file id given");

          case 12:
            if (documentId) {
              _context3.next = 14;
              break;
            }

            throw new Error("No document id given");

          case 14:
            client = Figma.Client({
              personalAccessToken: personalAccessToken
            });
            itemDocument = {};
            items = [];
            itemsWithUrls = [];

            getFileInfo =
            /*#__PURE__*/
            function () {
              var _ref3 = _asyncToGenerator(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee(task) {
                var file;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        _context.next = 2;
                        return client.file(fileId);

                      case 2:
                        file = _context.sent;
                        itemDocument = file.data.document.children.find(function (doc) {
                          return doc.id === documentId;
                        });

                        if (itemDocument.name) {
                          _context.next = 6;
                          break;
                        }

                        throw new Error("node id not found");

                      case 6:
                        task.title = "Found document ".concat(itemDocument.name);
                        return _context.abrupt("return", itemDocument);

                      case 8:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee, this);
              }));

              return function getFileInfo(_x2) {
                return _ref3.apply(this, arguments);
              };
            }();

            getItemsFromFrames = function getItemsFromFrames(task) {
              itemDocument.children.forEach(function (frame) {
                frame.children.filter(function (item) {
                  return item.type === "COMPONENT";
                }).forEach(function (item) {
                  items.push({
                    id: item.id,
                    name: item.name
                  });
                });
              });
              if (items.length === 0) throw new Error("No items found");
              task.title = "Found ".concat(items.length, " items");
              return items.length;
            };

            getImageURLs =
            /*#__PURE__*/
            function () {
              var _ref4 = _asyncToGenerator(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee2(task) {
                var itemIds, response, images;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        itemIds = items.map(function (item) {
                          return item.id;
                        });
                        _context2.next = 3;
                        return client.fileImages(fileId, {
                          ids: itemIds,
                          format: fileExtension,
                          scale: 1
                        });

                      case 3:
                        response = _context2.sent;

                        if (!response.data.err) {
                          _context2.next = 6;
                          break;
                        }

                        throw response.data.err;

                      case 6:
                        images = response.data.images;
                        itemsWithUrls = items.map(function (item) {
                          if (images.hasOwnProperty(item.id)) {
                            item.url = images[item.id];
                            return item;
                          }
                        });
                        task.title = "Found ".concat(itemsWithUrls.length, " matching URLs");
                        return _context2.abrupt("return", itemsWithUrls);

                      case 10:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2, this);
              }));

              return function getImageURLs(_x3) {
                return _ref4.apply(this, arguments);
              };
            }();

            saveImages = function saveImages(task) {
              try {
                itemsWithUrls.forEach(function (item, idx) {
                  var name = item.name.replace(/\/|\./g, "_");
                  (0, _saveImageToFs.saveImageToFs)(item.url, "".concat(name, ".").concat(fileExtension), output);
                });
                task.title = "Sucess! Saved images to '".concat(output, "'");
                return itemsWithUrls;
              } catch (e) {
                throw new Error("Error saving images to filesystem");
              }
            };

            taskItems = [{
              title: "Getting document information",
              task: function task(ctx, _task) {
                return getFileInfo(_task);
              }
            }, {
              title: "Find items in document",
              task: function task(ctx, _task2) {
                return getItemsFromFrames(_task2);
              }
            }, {
              title: "Get image URLs from Figma",
              task: function task(ctx, _task3) {
                return getImageURLs(_task3);
              }
            }, {
              title: "Save images to filesystem",
              task: function task(ctx, _task4) {
                return saveImages(_task4);
              }
            }];
            tasks = new _listr.default(taskItems);
            _context3.next = 26;
            return tasks.run();

          case 26:
            _context3.next = 31;
            break;

          case 28:
            _context3.prev = 28;
            _context3.t0 = _context3["catch"](0);
            console.error(_context3.t0);

          case 31:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 28]]);
  }));

  return function getFigmaAssets(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.getFigmaAssets = getFigmaAssets;