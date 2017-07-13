/**
 * Created by Ricky on 2017/4/17.
 */

define(function() {
    //验证方法序列
    var validateRuleGroup = {
        mobile: function(s) {
            s = $.trim(s);
            return s && /^1[3587][0-9]{9}$/.test(s);
        },
        password: function(s) {
            s = $.trim(s);
            return s && /^[^\s]{6,16}$/i.test(s);
        },
        smscode: function(s) {
            s = $.trim(s);
            return s && /^\d{4}$/i.test(s);
        },
        cncheck: function(s) {
            s = $.trim(s);
            return s && /.*[\u4e00-\u9fa5]+.*$/.test(s);
        },
        idcard: function(s) {
            var reg15, reg18;
            s = $.trim(s);
            reg15 = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{2}(\d|x)$/i;
            reg18 = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}(\d|x)$/i;
            return s && (reg15.test(s) || reg18.test(s));
        },
        mail: function(s) {
            s = $.trim(s);
            return s && /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(s);
        },
        isNotEmpty: function(s) {
            return s !== null && s !== undefined && s !== "";
        },
        isNumber: function(s) {
            return !isNaN(s);
        }
    };
    //默认错误提示
    var validateDefaultError = {
        mobile: "您输入的手机号码有误，请输入11位手机号码",
        password: "您输入的密码有误，请输入6~16位密码",
        smscode: "您输入的验证码有误，请输入4位验证码",
        cncheck: "您的输入有误，请输入中文",
        idcard: "您输入的身份证号码有误",
        mail: "您输入的邮箱地址有误",
        isNotEmpty: "此项为必填，不能留空",
        isNumber: "请输入数字"
    };
    //input回调事件组
    var validateRecallsGroup = {
        inputSuccess: false,
        inputFail: false
    };

    /**
     * @constructor validate
     * @param {dom} formDom 表单元素
     * @param {object} inputGroup 验证对象组 包含input的name和报错信息以及验证回调
     * @param {function} success
     * @return {Object} this
     */
    var validate = function(formDom, inputGroup, success) {
        var self = this;

        self.formDom = $(formDom);

        /**
         * @desc 表单数据有效性
         * @type {boolean}
         * @private
         */
        self._effectiveness = true;

        /**
         * @desc 通过验证的回调
         * @type {function}
         * @private
         */
        self._success = success;

        self.bindInputEvents(inputGroup);
        self.bindSubmit(inputGroup);

        return self;
    };

    //监听Input的Change事件
    validate.prototype.bindInputEvents = function(group) {
        var self = this;

        self.formDom.on('change', function(e) {
            var inputDom = $(e.target);
            var inputName = inputDom.attr('name');
            var val = inputDom.val();
            var setting = group[inputName];
            var ruleFn, ruleError, result;
            var formData = formToObject(self.formDom);

            if (!group[inputName]) {
                return false;
            } else if (typeof group[inputName] == "string") {
                ruleFn = validateRuleGroup[setting];
                ruleError = validateDefaultError[setting];
            } else {
                ruleFn = setting.check;
                ruleError = setting.error;
            }

            ruleFn = ruleFn || validateRuleGroup.isNotEmpty;
            result = ruleFn(val, formData, validateRuleGroup);

            if (typeof result == "string" && result != '') {
                ruleError = result;
                result = false;
            } else {
                result = Boolean(result);
            }

            if (result) {
                self._effectiveness = true;
                validateRecallsGroup.inputSuccess(inputDom);
            } else {
                self._effectiveness = false;
                validateRecallsGroup.inputFail(inputDom, ruleError);
            }
        });
    };

    //监听form表单提交事件
    validate.prototype.bindSubmit = function(group) {
        var self = this;

        self.formDom.on('submit', function(e) {
            e.preventDefault();
            var snapStatus = true;
            var formData;

            $.each(group, function(name) {
                var input = self.formDom.find('[name="' + name + '"]');
                input.trigger('change', {ignore: true}); // 添加ignore参数 避免遇到省市县组件的change事件被触发
                if (!self._effectiveness) snapStatus = false;
            });

            if (snapStatus) {
                self._effectiveness = true;
                formData = formToObject(self.formDom);
                self._success(formData);
            } else {
                self._effectiveness = false;
            }
        });
    };

    //将表单数据转化为Object
    function formToObject(form, trim) {
        var data;
        if (!form.serializeArray) {
            form = $(form);
        }
        data = {};
        if (trim === void 0) {
            trim = 1;
        }
        $.each(form.serializeArray(), function(i, field) {
            return data[field.name] = trim ? $.trim(field.value) : field.value;
        });
        return data;
    }

    return {
        addValidateRule: function(group) {
            $.extend(validateRuleGroup, group);
        },
        addValidateError: function(group) {
            $.extend(validateDefaultError, group);
        },
        addInputRecalls: function(fns) {
            $.extend(validateRecallsGroup, fns);
        },
        validate: function(formDom, inputGroup, success) {
            return new validate(formDom, inputGroup, success);
        }
    };
});