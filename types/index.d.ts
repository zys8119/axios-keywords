import {AxiosRequestConfig} from "axios";
export type AxiosKeywordsType = (config:AxiosRequestConfig,options:AxiosKeywordsOptions)=>Promise<AxiosRequestConfig>;
export interface AxiosKeywordsOptions {
    [key:string]:any;

    /**
     * 需要敏感检测数据
     */
    data?:any;
    /**
     * 远程敏感字典请求
     */
    axiosConfig?:AxiosRequestConfig;
    /**
     * 远程敏感字典请求相应code
     * @default 0
     */
    axiosConfigCode?:number;
    /**
     * 本地敏感字段集合
     */
    keywords?:keywordsType;
    /**
     * 是否开启敏感字段检测，默认不开启
     * @default false
     */
    keywordsDetection?:boolean;
    /**
     * 敏感检测的自定义规则
     */
    keywordsRules?:keywordsRules[];
    /**
     * 获取敏感词库错误提醒
     */
    errorMessage?:string;
    /**
     * 自定义敏感检测消息
     */
    customMessage?:customMessageType;
    /**
     * url白名单
     */
    urlWhitelist?:RegExp[];
}
export type keywordsType = string[];
interface FilterValue {
    text?: string | boolean;
    filter: Array<string>;
    sensitiveWordIndexs?: Array<number>;
    pass?: boolean;
}
export type customMessageType = (swhResult:FilterValue)=>string;
export type wordsMapType = {
    [key:string]:any;
}
export type keywordsRules = (wordsMap:wordsMapType,config:AxiosRequestConfig)=>Promise<any>;



declare const AxiosKeywords:AxiosKeywordsType;
export default AxiosKeywords;