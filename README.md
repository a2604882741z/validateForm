---
#表单验证插件
-------------

#####使用注意
1. 本插件依赖zepto或者jQuery
2. 插件内部已经提供了常见的验证方法，您也可以自行扩展验证列表。
3. 请使用form构建表单节点，通过submit按钮触发提交事件，本插件会拦截掉默认的提交事件，通过callback返回通过验证的数据。
4. 在插件里提供了三个个方法对全局的表单验证配置，分别是：

- addInputRecalls (配置全局的单个输入框验证回调)

```javascript
//配置全局默认单个input验证成功、失败后的处理方法
validateConfiguration.addInputRecalls({
	inputSuccess: function(dom) {
		dom.addClass('currect').removeClass('error');
	},
	inputFail: function (dom, error) {
		dom.removeClass('currect').addClass('error');
		alert(error);
	}
});
```

- addValidateRule (添加全局的验证方法)

```javascript
validateConfiguration.addValidateRule({
	isNumber: function(s) { //isNumber是此项验证方法名
		return !isNaN(s); //返回TRUE和False代表这成功和失败
	}
});
```

-  addValidateError (添加默认的报错内容)

```javascript
validateConfiguration.addValidateError({
	isNumber: "请输入数字"
})；
```

- validate (表单验证函数，return实例化后的对象)

```javascript
validate(form, {}, callback); //接收三个参数 form对象，验证规则，成功回调
```

####示例：
```javascript
new validate('#formNode', {
	userName: {
		check: function (s) {
			if (!/^[^\s]{6,10}$/i.test(s))
				return '请输入6-10位账号';

			return true;
		}
	},
	password: 'password',
	repassword: {
		check: function (s, formData) {
			if (s !== formData.password)
				return '您输入的两次密码不一致';

			return true;
		}
	},
	phoneNumber: 'mobile',
	smsCode: 'smscode'
}, function (formData) {
	console.log(formData); //传递表单数据
});
```

####验证规则说明：
请使用Input的name值作为Object的key值
```javascript
{
	userName: {},
	password: {}
}
```

每个Object包含error和check的子值，通过**check**函数返回的**布尔值**决定是否通过验证，check函数里传入的参数包含 **value**(当前值)、**formData**(整个表单值)、**rules**(全局验证规则)
```javascript
{
    userName: {
		error: '不能输入空字符串'，
		check: function(val, formData, rules) {
			return val !== "";
		}
	}
}
```
error并不是必填项，可以通过check函数返回报错信息，这对需要做出多重判断会有帮助
```javascript
{
    userName: {
		check: function(val) {
			if (error === "") {
				return "不能输入空字符串";
			} else if (!/[A-Za-z0-9]{4,10}/.test(val)) {
				return "请输入英文和数字组合，并且4~10位长度"；
			}
			return true;
		}
	}
}
```
check函数也可以省略，你可以直接调用已存在的验证规则名
```javascript
{
    userName: 'isNotEmpty' //根据已添加的验证规则匹配，验证不通过后调用对应的报错文本
}
```