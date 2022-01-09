"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var sensitive_word_helper_plus_1 = require("sensitive-word-helper-plus");

var axios_1 = require("axios");

var axiosKeywords = function axiosKeywords(config, _a) {
  var //  需要敏感检测数据
  data = _a.data,
      // 远程敏感字典请求
  axiosConfig = _a.axiosConfig,
      // 远程敏感字典请求相应code
  axiosConfigCode = _a.axiosConfigCode,
      // 本地敏感字段集合
  keywords = _a.keywords,
      // 是否开启敏感字段检测，默认不开启
  keywordsDetection = _a.keywordsDetection,
      // 敏感检测的自定义规则
  keywordsRules = _a.keywordsRules,
      // 获取敏感词库错误提醒
  errorMessage = _a.errorMessage,
      // 自定义敏感检测消息
  customMessage = _a.customMessage,
      // url白名单
  urlWhitelist = _a.urlWhitelist;

  try {
    // 判断是否进行关键字敏感检测
    urlWhitelist = urlWhitelist || [];
    var urlWhitelistPass = urlWhitelist.length > 0 ? (urlWhitelist || []).some(function (reg) {
      return reg.test(config.url);
    }) : false;

    if (!keywordsDetection || !data || urlWhitelistPass) {
      return Promise.resolve(config);
    }

    var user_keywords_1 = keywords;
    var name_1 = "$$$$keywords"; // 生成Map映射

    var wordsMap_1 = {};
    var keyDeep_1 = "";
    JSON.stringify(data, function (key, value) {
      keyDeep_1 += ".".concat(key);

      if (!["[object Object]", "[object Array]"].includes(Object.prototype.toString.call(value))) {
        wordsMap_1[keyDeep_1 || name_1] = value;
      }

      return value;
    });
    return new Promise(function (resolve, reject) {
      var keywords = null; // 尝试获取缓存数据

      try {
        keywords = JSON.parse(localStorage.getItem(name_1));
      } catch (e) {// err
      } // 自定义规则校验


      var keywordsRulesInit = function keywordsRulesInit() {
        if (keywordsRules && keywordsRules.length > 0) {
          Promise.all(keywordsRules.map(function (e) {
            return e(wordsMap_1, config);
          })).then(function () {
            resolve(config);
          })["catch"](function (err) {
            reject(new Error(err));
          });
        } else {
          resolve(config);
        }
      }; // 敏感词检测


      var keywordsInit = function keywordsInit(_a) {
        var keywords = _a.keywords;
        keywords = keywords || [];
        keywords = keywords.concat(user_keywords_1 || []);

        if (keywords.length === 0) {
          keywordsRulesInit();
        } else {
          var swh = new sensitive_word_helper_plus_1["default"]({
            keywords: keywords,
            replacement: '*' // 默认是 *, 比如 'a b' 默认会替换成  '* *'

          });
          var swhResult = swh.filterSync(Object.values(wordsMap_1).join(""));

          if (swhResult.pass) {
            keywordsRulesInit();
          } else {
            customMessage = customMessage || function (swhResult) {
              return "\u8BF7\u6C42\u5931\u8D25\uFF0C\u7CFB\u7EDF\u81EA\u52A8\u68C0\u6D4B\u7684\u60A8\u63D0\u4EA4\u7684\u5185\u5BB9\u5305\u542B\u3010".concat(swhResult.filter.join("、"), "\u3011\u7B49\u654F\u611F\u5B57\u6837\uFF0C\u7981\u6B62\u63D0\u4EA4");
            };

            reject(new Error(customMessage(swhResult)));
          }
        }
      }; // 判断是否需要动态获取远端词语


      if (!axiosConfig || keywords) {
        // 从缓存取
        keywordsInit(keywords || {});
      } else {
        errorMessage = errorMessage || "获取敏感词失败!";
        axiosConfigCode = axiosConfigCode || 0; // 从远端取

        (0, axios_1["default"])(axiosConfig).then(function (res) {
          if (res.data.code === axiosConfigCode) {
            // 写入缓存
            localStorage.setItem(name_1, JSON.stringify(res.data.data || {}));
            keywordsInit(res.data.data || {});
          } else {
            reject(new Error(errorMessage));
          }
        })["catch"](function () {
          reject(new Error(errorMessage));
        });
      }
    });
  } catch (e) {
    // 容错误机制
    console.error(e);
    return Promise.reject(new Error("敏感词检测内部错误！"));
  }
};

exports["default"] = axiosKeywords;