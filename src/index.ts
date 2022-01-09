import SWH from "sensitive-word-helper-plus"
import axios from "axios"
import {AxiosKeywordsType, keywordsType, wordsMapType} from "../types";

const axiosKeywords:AxiosKeywordsType =  (config, {
    //  需要敏感检测数据
    data,
    // 远程敏感字典请求
    axiosConfig,
    // 远程敏感字典请求相应code
    axiosConfigCode,
    // 本地敏感字段集合
    keywords,
    // 是否开启敏感字段检测，默认不开启
    keywordsDetection,
    // 敏感检测的自定义规则
    keywordsRules,
    // 获取敏感词库错误提醒
    errorMessage,
    // 自定义敏感检测消息
    customMessage,
    // url白名单
    urlWhitelist,
})=>{
    try {
        // 判断是否进行关键字敏感检测
        urlWhitelist = urlWhitelist || [];
        const urlWhitelistPass = urlWhitelist.length > 0 ? (urlWhitelist || []).some(reg=>reg.test(config.url)):true;
        if(!keywordsDetection|| !data || urlWhitelistPass){
            return Promise.resolve(config);
        }
        const user_keywords = keywords;
        const name = "$$$$keywords";
        // 生成Map映射
        let wordsMap:wordsMapType = {};
        let keyDeep = "";
        JSON.stringify(data,  (key,value) =>{
            keyDeep += `.${key}`
            if(!["[object Object]","[object Array]"].includes(Object.prototype.toString.call(value))){
                wordsMap[keyDeep || name] = value;
            }
            return value;
        })
        return new Promise((resolve, reject) => {
            let keywords = null;
            // 尝试获取缓存数据
            try {
                keywords = JSON.parse(localStorage.getItem(name))
            }catch (e) {
                // err
            }
            // 自定义规则校验
            const keywordsRulesInit = ()=>{
                if(keywordsRules && keywordsRules.length > 0){
                    Promise.all((keywordsRules).map(e=>e(wordsMap, config))).then(()=>{
                        resolve(config)
                    }).catch(err=>{
                        reject(new Error(err))
                    })
                }else {
                    resolve(config)
                }
            }
            // 敏感词检测
            const keywordsInit = ({keywords}:{
                [key:string]:any;
                keywords:keywordsType
            })=>{
                keywords = keywords || [];
                keywords = keywords.concat(user_keywords || []);
                if(keywords.length === 0){
                    keywordsRulesInit();
                }else {
                    const swh = new SWH({
                        keywords:keywords,
                        replacement: '*' // 默认是 *, 比如 'a b' 默认会替换成  '* *'
                    });
                    const swhResult = swh.filterSync(Object.values(wordsMap).join(""));
                    if( swhResult.pass){
                        keywordsRulesInit();
                    }else {
                        customMessage = customMessage || ((swhResult)=>`请求失败，系统自动检测的您提交的内容包含【${swhResult.filter.join("、")}】等敏感字样，禁止提交`);
                        reject(new Error(customMessage(swhResult)))
                    }
                }
            }
            // 判断是否需要动态获取远端词语
            if(!axiosConfig || keywords){
                // 从缓存取
                keywordsInit(keywords || {});
            }else {
                errorMessage = errorMessage || "获取敏感词失败!";
                axiosConfigCode = axiosConfigCode || 0;
                // 从远端取
                axios(axiosConfig).then(res=>{
                    if(res.data.code === axiosConfigCode){
                        // 写入缓存
                        localStorage.setItem(name, JSON.stringify(res.data.data || {}))
                        keywordsInit(res.data.data || {});
                    }else{
                        reject(new Error(errorMessage))
                    }
                }).catch(()=>{
                    reject(new Error(errorMessage))
                })
            }
        })
    }catch (e) {
        // 容错误机制
        console.error(e)
        return  Promise.reject(new Error("敏感词检测内部错误！"))
    }
}

export default axiosKeywords;