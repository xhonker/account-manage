// ==UserScript==
// @name         account-manage
// @namespace    https://github.com/xhonker/account-manage
// @version      0.1.16
// @description  internal account manage
// @author       Quicker
// @include      *://e.360.cn/
// @include      *://cas.baidu.com*
// @include      *://ad.oceanengine.com/pages/login/*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at document-end
// ==/UserScript==

(function () {
  'use strict';
  document.body.setAttribute('oncontextmenu', 'return false');
  document.body.setAttribute('onselectstart', 'return false');
  const hostname = window.location.hostname;
  const isBaidu = /baidu/gi.test(hostname);
  const isQihu = /360/gi.test(hostname);
  const isToutiao = /oceanengine/gi.test(hostname);
  function start() {
    postMessage('GET_ACCOUNT');
    window.onmessage = handlerEvent;
    window.onbeforeunload = () => {
      postMessage('WINDOW_CLOSE');
    };
  }
  function handlerEvent(ev) {
    if (/localhost/gi.test(ev.origin)) {
      switch (ev.data.action) {
        case 'GET_ACCOUNT':
          const payload = ev.data.payload;
          isQihu && login360(payload);
          isBaidu && loginBaidu(payload);
          isToutiao && loginToutiao(payload);
          break;
        case 'RETRY_CAPTCHA':
          postMessage('CAPTCHA', getCaptcha(ev.data.payload));
          break;
        default:
          break;
      }
    }
  }

  function login360(data) {
    let $username = document.querySelector('input[name="userName"]');
    if (!$username) return setTimeout(() => login360(data), 500);
    let { username, password } = data;
    $username.value = username;
    let $password = document.querySelector('input[name="password"]');
    let login = document.querySelector("input[value='登录']");
    $password.value = password;
    login.click();
  }

  function loginToutiao(data) {
    let $username = document.querySelector("input[name='account']");
    let $password = document.querySelector("input[name='password']");
    let $login = document.querySelector('[class$=login-button]');

    if (!$username) return setTimeout(() => loginToutiao(data), 500);
    const { username, password } = data;
    $username.value = username;
    $password.value = password;
    $login.click();
  }

  function loginBaidu(data) {
    const $username = document.querySelector("input[name='entered_login']");
    const $password = document.querySelector('#ucsl-password-edit');
    const $login = document.querySelector('#submit-form');
    const $loginType = document.querySelector('.login-header .pull-left');
    const $changeLoginType = document.querySelector('.login-header .pull-right');
    const isScanLogin = $loginType.textContent === '扫码登录';
    if (isScanLogin) {
      $changeLoginType.click();
    }
    if (!$username && !$password) return setTimeout(() => loginBaidu(data), 500);
    const { username, password } = data;
    $username.value = username;
    $password.value = password;
    postMessage('CAPTCHA', getCaptcha());
    // $login.click();
  }

  function getCaptcha(retry) {
    console.log('Quicker: getCaptcha -> retry', retry);
    const $captcha = document.querySelector('#token-img');
    if (retry) {
      $captcha.click();
    }
    const c = document.createElement('canvas');
    c.width = 80;
    c.height = 40;
    const ctx = c.getContext('2d');
    ctx.drawImage($captcha, 0, 0, 80, 40);
    let result = c.toDataURL('image/jpg');
    return result.split(',')[1];
  }
  function postMessage(action, payload = null) {
    window.opener.postMessage({ action, payload }, '*');
  }
  start();
})();
