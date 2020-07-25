---
title: WEB 代理服务器
date: 2020-07-22
tags:
 - java
 - socket
 - http
categories: 
 - network
---

WEB 代理服务器监听客户端的 request 请求，将 request 转发到目标 HTTP 服务器，并将响应的文件转发到客户端。这些代理服务器在某些情况下非常有用，例如在防火墙上，它们允许访问某些页面，拒绝访问其他页面。该 WEB 代理服务器应该只接受客户端 `HTTP/1.0 GET` 请求，并从 URL 中取得目标 HTTP 服务器地址与端口，并构造新的请求从指定的服务器获取所请求的文件。WEB 代理服务器必须能够从任意端口加载网页，支持并发且使用适当的错误响应。

<!-- more -->

所以之前写的 WEB 客户端可以用上了，用来模拟发送 `GET` 请求，但是还得给自己造个防火墙:scream::scream:，那就只能开始辽:bicyclist:。

我的思路是这样的：在客户端向外发送请求的时候，代理服务器是作为服务器端接收请求的。当服务器端向外界发送请求的时候，它又是作为客户端而存在的。除此之外，还需要一个线程池来应对多线程并发的情况，也就是要额外的处理类，所以，一共需要三个类 `ProxyServer` 、 `ProxyClient` 、 `ProxyHandler`。

## ProxyServer 代理服务器服务端

代理服务器的服务器端和之前的服务器端一样，都是将执行交由线程池来维护。

```java
public class ProxyServer {
    /** 定义代理服务器的socket */
    ServerSocket serverSocket;

    /** 定义代理服务器监听的tcp端口号 */
    private final int PORT = 8000;

    /** 定义每个处理器的核心的线程数量 */
    private final int POOLSIZE = 4;

    /** 定义线程池 */
    ExecutorService executorService;

    /**
     * 构造函数，初始化代理服务器
     */
    public ProxyServer() throws IOException {
        // 用监听端口号PORT实例化socket
        serverSocket = new ServerSocket(PORT);

        // 创建线程池，并用当前可使用的处理器核心数*4来定义整个线程池可用的线程数量
        executorService = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors() * POOLSIZE);

        // 初始化成功
        System.out.println("The proxy server is now handing the request");
    }

    /**
     * 代理服务器的运行方法
     */
    public void service() {
        Socket socket = null;
        while (true) {
            try {
                // 等待客户端连接
                socket = serverSocket.accept();
                // 把执行交给线程池维护
                executorService.execute(new ProxyHandler(socket));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public static void main(String args[]) throws IOException {
        // 启动代理服务器
        new ProxyServer().service();
    }
}
```

## ProxyClient 代理服务器客户端

在定义 `ProxyClient` 的变量的时候我们需要注意到无论是 `Socket` 还是 `BufferedOutputStream` 和 `BufferedInputStream`，都是把代理服务器作为一个客户端去进行对外请求的，这一点和之前是有区别的。


```java
 /** 定义用于缓存数据的字节数组的大小 */
private static int buffer_size = 8192;

/** 定义报文中用于对报文进行分割的CRLF标志 */
private static String CRLF = "\r\n";

/** 定义用于缓存数据的字节数组 */
private byte[] buffer;

/** 定义储存报文头的字符串 */
private StringBuffer header = null;

/** 定义储存报文响应内容的字符串 */
private StringBuffer response = null;

/** 定义连接外部服务器的socket */
private Socket proxySocket = null;

/** 定义代理服务器客户端的输入输出流 */
BufferedOutputStream ostream = null;
BufferedInputStream istream = null;
```

构造函数初始化。

```java
public ProxyClient() {
    buffer = new byte[buffer_size];
    header = new StringBuffer();
    response = new StringBuffer();
}
```

连接到指定的主机和端口号。

```java
public void connect(String host, int port) throws Exception {
    // 实例化socket连接
    proxySocket = new Socket(host, port);

    // 创建输出流
    ostream = new BufferedOutputStream(proxySocket.getOutputStream());

    // 创建输出流
    istream = new BufferedInputStream(proxySocket.getInputStream());
}
```

发送 `GET` 请求以及处理响应。

```java
public void processGetRequest(String request, String host) throws Exception {
    request += CRLF;
    request += "Host: " + host + CRLF;

    // 取消长连接
    request += "Connection: Close" + CRLF + CRLF;

    buffer = request.getBytes();
    ostream.write(buffer, 0, request.length());
    ostream.flush();

    // 等待响应
    processResponse();
}
```

```java
public void processResponse() throws Exception {
    int last = 0, c = 0;
    // 处理响应头并存入字符串中，根据之前的代码改编
    boolean inHeader = true;
    while (inHeader && ((c = istream.read()) != -1)) {
        switch (c) {
            case '\r':
                break;
            case '\n':
                if (c == last) {
                    inHeader = false;
                    break;
                }
                last = c;
                header.append("\n");
                break;
            default:
                last = c;
                header.append((char) c);
        }
    }

    // 把字节数组读入到响应内容的字符串中，编码采用UTF-8
    while (istream.read(buffer) != -1) {
        response.append(new String(buffer, "UTF-8"));
        buffer = new byte[buffer_size];
    }
}
```


## ProxyHandler 代理服务器执行

`ProxyHandler` 类是根据客户端的请求报文向外界的服务器请求资源，可以看到，在这个类里面初始化了一个 `ProxyClient` 类，因为之前定义的 `ProxyClient` 类的 `connect()` 方法并没有定义主机地址和连接的端口号， `ProxyHandler` 类利用 `connect()` 方法向外界请求资源，而它自己的 `Socket` 则是用来和客户端进行数据交换。

根据 URL 发送 `GET` 请求：

```java
private void requestGet(URL url) throws Exception {
    // 默认去连接80端口，否则连接url对象里面指定的端口
    proxyClient.connect(url.getHost(), url.getPort() == -1 ? 80 : url.getPort());
    String request = "GET " + url.getFile() + " HTTP/1.1";
    proxyClient.processGetRequest(request, url.getHost());
}
```

从代理服务器的客户端接收响应，并把报文发送到请求的客户端：

```java
private void responseGet() throws IOException {
    String header = proxyClient.getHeader() + "\n";
    String body = proxyClient.getResponse();
    buffer = header.getBytes();

    ostream.write(buffer, 0, header.length());
    ostream.write(body.getBytes());
    ostream.flush();
}
```

到此，基本上一个 WEB 代理服务器就完成了，喜欢的话留言鼓励一下叭。:balloon::gift::tada: