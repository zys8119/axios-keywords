# axios-keywords

axios敏感词检测

## 安装

`npm i axios-keywords -S`

## 引用

```typescript
import {create} from "axios";
import axiosKeywords from "axios-keywords";
const service = create();
service.interceptors.request.use((config) => {
    return axiosKeywords(config, options)
})
```

## 案例

```typescript
import axiosKeywords from "axios-keywords";
axiosKeywords(config, {
    data:{
        // ....
    },
    axiosConfig:{
        url:"/api",
        method:"get",
        // ...
    },
    axiosConfigCode:0,
    keywords:["敏感关键词组", "******"],
    keywordsDetection:true,
    keywordsRules:[
        (wordsMap, config)=>{
            if(!Object.values(wordsMap).some(v=>/^[0-9]*$/.test(v))){
                return  Promise.resolve();
            }
            return Promise.reject("提交的内容禁止全部数字")
        },
        // ...
    ],
    errorMessage:"获取敏感词失败!",
    customMessage:(swhResult)=>`请求失败，系统自动检测的您提交的内容包含【${swhResult.filter.join("、")}】等敏感字样，禁止提交`,
    urlWhitelist:[
        /url_keywords/,
        // ...
    ]
})
```