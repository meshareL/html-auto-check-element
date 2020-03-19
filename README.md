# &lt;auto-check&gt; Element
A form input validator

## Installation
```text
npm install @tomoeed/html-auto-check-element --save
```

## Usage
```html
<auto-check href="/check" msg='{"typeMismatch": "type mismatch", "valueMissing": "value mismatch", "all": "enter the correct email"}'>
    <label for="email">Email</label>
    <input id="email" name="email" required type="email">
</auto-check>
```

## Attributes
- `href` 服务端验证`URL`
- `msg` 验证错误提示信息 [InvalidMessage](https://github.com/meshareL/html-auto-check-element/blob/master/index.d.ts)

## Events
- `auto-check:success` 验证成功
  ```javascript
  document.addEventListener('auto-check:success', event => {
      const element = event.target;
      element.classList.add('is-successful');
  });
  ```

- `auto-check:error` 验证错误

  - `detail.response`
  ```javascript
  document.addEventListener('auto-check:error', async event => {
      const {response} = event.detail;
  
      // server validate failed
      if (response instanceof Response) {
          const {message} = await response.json();
      }
  
      // HTML constraint validation failed
      console.log(response);
  });
  ```

- `auto-check:ajax-start` 开始服务器验证, 该事件可取消. 如果取消该事件将不会进行服务端验证

- `auto-check:ajax-send` 发送网络请求之前

  - `detail.requestInit` 发送网络请求之前更改`fetch`请求参数
  ```javascript
  document.addEventListener('auto-check:send', event => {
      const {requestInit} = event.detail;
      requestInit.headers.append('X-Requested-With', 'XMLHttpRequest');
  });
  ```

- `auto-check:ajax-end` 网络请求已完成, 在`auto-check:ajax-success`与`aut-check:ajax-error`事件之前调度
  ```javascript
  document.addEventListener('auto-check:ajax-end', event => {
      const element = event.target;
      element.classList.remove('is-loading');
  });
  ```

- `auto-check:ajax-success` 服务器返回状态码 `200 >= status < 300`

  - `detail.response` [Fetch Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
  ```javascript
  document.addEventListener('auto-check:ajax-success', async event => {
      const element = event.target;
      element.classList.add('is-successful');
  
      const response = await event.detail.response.json();
  });
  ```

- `auto-check:ajax-error` 服务器返回状态码 `200 < status >= 300`

  - `detail.response` [Fetch Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
  ```javascript
  document.addEventListener('auto-check:ajax-error', async event => {
      const element = event.target;
      element.classList.add('is-errored');
      
      const response = await event.detail.response.json();
  });
  ```
  
- `auto-check:network-error` 网络故障或任何阻止请求完成

  - `detail.error`
  ```javascript
  document.addEventListener('auto-check:network-error', event => {
    console.log(event.detail.error.message);
  });
  ```

## License
[Apache-2.0](https://github.com/meshareL/html-auto-check-element/blob/master/LICENSE)
