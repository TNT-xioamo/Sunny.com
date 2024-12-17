---
title: 如何实现jwt鉴权机制?
tags: [鉴权，前端]
index_img: /article-img/Cover.jpg
categories: js
date: 2024-12-17
mermaid: true
---

# 一、JWT简介

  JSON Web Token(JWT)是一种用于在用户和服务器之间传递安全可靠信息的字符串书写规范。它 由三部分组成:头部(Header)、载荷(Payload)、签名(Signature)，并以 . 进行拼接。JWT在 前后端分离的开发中常用于身份验证。

  ### 头部(Header)
  头部指定使用的加密算法，一般使用HMAC SHA256。头部信息经过Base64编码，例如:
  ```json
    { "alg": "HS256", "typ": "JWT" }
  ```
  编码后为:
  ```json
    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
  ```

  ### 载荷(Payload)
  载荷是JWT的主体部分，包含声明(claims)，声明是关于实体(通常是用户)和其他数据的声明。声明一般包括标准声明和自定义声明。标准声明包括iss(签发人)、exp(过期时间)、sub(主题)、aud(受众)等。自定义声明可以包含任何信息，例如用户ID、角色等。载荷信息经过Base64编码，例如:
  ```json
    { "sub": "1234567890", "name": "John Doe", "iat": 1516239022 }
  ```
  编码后为:
  ```json
    eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ
  ```

  ### 签名(Signature)
  签名是对头部和载荷的加密，防止数据被篡改。签名算法为: HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)。其中secret是服务器端保存的密钥，用于验证JWT的合法性。签名信息经过Base64编码，例如: 
  ```json
    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
  ```

# 二、实现JWT鉴权机制

  ### 1. 生成JWT
  在用户登录成功后，服务器端生成JWT，并将其返回给客户端。JWT的生成可以使用jsonwebtoken库，例如:
  ```javascript
    const crypto = require("crypto");
    const jwt = require('jsonwebtoken');
    const secret = 'mysecret'; // 服务器端保存的密钥
    // 用户列表(应该使用数据库存储，这里仅作演示) 
    let userList = [];
    class UserController {
      // 用户登录
      static async login(ctx) {
        const { username, password } = ctx.request.body;
        if (!data.name || !data.password) {
          return (ctx.body = { code: "000002", message: "参数不合法",});
        }
        const result = userList.find(item => item.name === username && item.password === crypto.createHash("md5").update(data.password).digest("hex"));
        if (result) {
          const token = jwt.sign({ username: result.name }, secret, { expiresIn: "1h" });
          return (ctx.body = { code: "000000", message: "登录成功", data: { token } });
        } else {
          return (ctx.body = { code: "000002", message: "用户名或密码错误" });
        }
    }
```

# 优缺点

### 优点:
--- JSON具有通用性，可跨语言使用。 
--- JWT结构简单，字节占用小，便于传输。
--- 服务器无需保存会话信息，容易进行水平扩展。
--- 一处生成，多处使用，可解决分布式系统中的单点登录问题。
--- 可防护CSRF攻击。

### 缺点:
--- JWT一旦签发，在有效期内将会一直有效，无法中途废弃，除非服务器主动修改密钥。
--- JWT是自我包含的，如果其中包含敏感信息，客户端就能够在不与服务器通信的情况下获取到这些信息，会存在安全风险。
--- 载荷部分仅进行简单编码，只能存储逻辑必需的非敏感信息。
--- 需要保护好加密密钥，一旦泄露后果严重。
--- 为避免Token被劫持，建议使用HTTPS协议保护通信安全。