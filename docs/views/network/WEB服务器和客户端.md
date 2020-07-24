---
title: WEB 服务器和客户端
date: 2020-07-23
tags:
 - java
 - socket
 - http
categories: 
 - network
---

编写 `HTTP` 服务器，创建一个端口号为 `80` 的套接字，并等待传入的请求。服务器只需成功地响应使用 `GET` 和 `PUT` 方法的请求，但对其他所有请求（有效的或无效的）的都应返回 `RFC` 指定的响应。在任何情况下确保服务器不会崩溃或挂起。在成功的响应中，服务器应该指定至少两种 `MIME` 类型 —— `HTML` 和 `JPEG` 文件，即文件扩展名分别为 `.html` 和 `.jpg` 的文件，服务器必须能够将 `.jpg` 图像嵌入到 `HTML` 文档中。

<!-- more -->

其实相对于网络文件服务来说，这个主要是增加了一个对于 `HTTP` 报文的处理，还有就是图像嵌入到 `HTML` 文档这个要求。因为一般去请求网页资源的话是先请求 `HTML` 文档，然后解析到相关的链接的时候再去请求链接所指向的资源，也就是说解析到链接的时候应该再发起一次请求，这样的话其实得用正则表达式去匹配相应的 `src` 资源标志，根据是否匹配到链接来决定是否发起请求，而且在 `PUT` 的时候和 `GET` 的时候都得进行这个操作。我换了一种解决的方式，把图片转为 `Base64` 编码，在 `PUT` 的时候嵌入到 `HTML` 文档中，从而不用再单独请求图片资源（图片比较小的时候效果更好:no_mouth:）。

## HTTP 简介

- `HTTP 1.0` 规定浏览器与服务器只保持短暂的连接，浏览器的每次请求都需要与服务器建立一个 `TCP` 连接，服务器完成请求处理后立即断开 `TCP` 连接，服务器不跟踪每个客户也不记录过去的请求。

- `HTTP 1.1` 则支持持久连接，并且默认使用长连接。在同一个 `TCP` 的连接中可以传送多个 `HTTP` 请求和响应，多个请求和响应可以重叠，多个请求和响应可以同时进行，更加多的请求头和响应头。

### HTTP 请求方法对比

- `GET` 操作是安全的。所谓安全是指不管进行多少次操作，资源的状态都不会改变。比如用 `GET` 浏览文章，不管浏览多少次，那篇文章还在那，没有变化。当然，你可能说每浏览一次文章，文章的浏览数就加一，这不也改变了资源的状态么？这并不矛盾，因为这个改变不是 `GET` 操作引起的，而是用户自己设定的服务端逻辑造成的。

- `PUT` ，`DELETE` 操作是幂等的。所谓幂等是指不管进行多少次操作，结果都一样。比如用 `PUT` 修改一篇文章，然后再做同样的操作，每次操作后的结果并没有不同，`DELETE` 也是一样。因为 `GET` 操作是安全的，所以它自然也是幂等的。

- `POST` 操作既不是安全的，也不是幂等的，比如常见的 `POST` 重复加载问题：当我们多次发出同样的 `POST` 请求后，其结果是创建出了若干的资源。

::: tip
安全和幂等的意义在于：当操作没有达到预期的目标时，我们可以不停的重试，而不会对资源产生副作用。从这个意义上说， `POST` 操作往往是有害的，但很多时候我们还是不得不使用它。
:::

### HTTP 响应状态码

常见的有如下状态码：
- 100 Continue：服务器通知浏览器之前一切正常，请客户端继续请求，如果请求结束，可忽略。
- 200 OK：请求成功。
- 201 Created：常用于 `POST` ， `PUT` 请求，表明请求已经成功，并新建了一个资源，且在响应体中返回路径。
- 204 No Content：请求没有数据返回，但是头信息有用，用户代理（浏览器）会更新缓存的头信息。
- 301 Moved Permanently：请求资源的 URL 被永久的改变，新的 URL 会在响应的 `Location` 中给出。
- 304 Not Modified：资源未变更。服务器根据请求头判断，需要资源未修改，只返回响应头，否则将资源一起返回。
    - 请求方法安全（如 `GET` ， `HEAD` 请求）。
    - 条件请求并且使用了 `If-None-Match` 或者 `If-Modified-Since` 的请求头。
- 400 Bad Request：请求语法有问题，服务器无法识别。
- 404 Not Found：URL 无效或者 URL 有效但是没有资源。
- 500 Internal Server Error：服务器内部错误，未捕获。

## Client 客户端

这里只展示了 `Client` 类的核心代码，这个类主要是用来与用户进行直接的交互的，可以对非 `GET` 和 `PUT` 请求进行过滤，这样就不用发送到服务器端进行处理，只有格式正确的报文才能成功发送。然后就是打印响应报文的响应头，对 `GET` 请求的非 `404` 和 非 `400` 响应进行文件的保存。


```java
public static void main(String[] args) throws Exception {
    try {

        /** Create a new HttpClient object. */
        HttpClient myClient = new HttpClient();

        /** Parse the input arguments. */
        if (args.length != 1) {
            System.err.println("Usage: Client <server>");
            System.exit(0);
        }

        /** Connect to the input server. */
        myClient.connect(args[0]);

        /** Read the get request from the terminal. */
        screen.println(args[0] + " is listening to your request:");
        String request = keyboard.readLine();

        if (request.startsWith("GET")) {

            /** Ask the client to process the GET request. */
            myClient.processGetRequest(request);

        } else if (request.startsWith("PUT")) {

            /** Ask the client to process the PUT request. */
            myClient.processPutRequest(request);

        } else {

            /** Do not process other request. */
            screen.println("Bad request! Please use GET or PUT.\n");
            myClient.close();
            return;

        }

        /** Get the headers and display them. */
        screen.println("Header: \n");
        screen.print(myClient.getHeader() + "\n");
        screen.flush();

        if (request.startsWith("GET") && (!myClient.getHeader().toString().contains("404")
                && !myClient.getHeader().toString().contains("400"))) {
            /** Ask the user to input a name to save the GET resultant web page. */
            screen.println();
            screen.print("Enter the name of the file to save: \n");
            screen.flush();
            String filename = keyboard.readLine();
            FileOutputStream outfile = new FileOutputStream(filename);

            /** Save the response to the specified file. */
            String response = myClient.getResponse();
            outfile.write(response.getBytes("iso-8859-1"));
            outfile.flush();
            outfile.close();
        }

        /** Close the connection client. */
        myClient.close();
    } catch (Exception e) {
        e.printStackTrace();
    }
}
```

## HttpClient 客户端执行

`HttpClient` 类直接与服务器端进行数据交换。在之前 `Client` 类中对于 `GET` 和 `PUT` 具体的处理都放到这个类中完成。

对于 `GET` 请求的执行：

```java
public void processGetRequest(String request) throws Exception {
    /** Send the request to the server. */
    request += CRLF + CRLF;
    buffer = request.getBytes();
    ostream.write(buffer, 0, request.length());
    ostream.flush();

    /** waiting for the response. */
    processResponse();
}
```

即使文件不存在或者报文不完整也要发送 `Content-length: 0` 的报文，因为服务器端会根据各种情况返回响应的报文。 `POST` 请求的执行：

```java
public void processPutRequest(String request) throws Exception {
    // 利用正则表达式，以空白字符（可能是空格、制表符、其他空白）为标志，拆分报文
    String[] requestSplit = request.split("\\s");
    // 定义客户端要上传的文件
    File file = null;
    // request的每一行要以CRLF结束
    request += CRLF;

    // 判断报文格式是否正确，正确长度应为3，示例“PUT /smile.jpg HTTP/1.0”
    if (requestSplit.length == 3) {
        // 拼接出文件路径
        String filename = requestSplit[1];
        file = new File(clientPath + filename);

        // 格式正确且找到文件
        if (file.exists()) {
            // 封装报文，加CRLF表示消息报头结束
            request += "Content-length: " + file.length() + CRLF + CRLF;
            buffer = request.getBytes();
            ostream.write(buffer, 0, buffer.length);

            // 获得报文的body
            FileInputStream fileInputStream = new FileInputStream(file);
            long num = file.length() / buffer_size + 1;
            int i = 1;
            while (i <= num) {
                i++;
                buffer = new byte[buffer_size];
                fileInputStream.read(buffer);
                ostream.write(buffer, 0, buffer.length);
            }
            fileInputStream.close();
            ostream.flush();

        } else {
            // 文件不存在则发送长度为0的body
            System.out.println("File do not exist!\n");
            request += "Content-length: 0" + CRLF + CRLF;
            buffer = request.getBytes();
            ostream.write(buffer, 0, buffer.length);
            ostream.flush();
        }

    } else {
        // 报文不完整也发送长度为0的body
        System.out.println("The message is incomplete!\n");
        request += "Content-length: 0" + CRLF + CRLF;
        buffer = request.getBytes();
        ostream.write(buffer, 0, buffer.length);
        ostream.flush();
    }

    /** waiting for the response. */
    processResponse();
}
```

## Server 服务器端

`Server` 服务器端与之前的网络文件的服务器端类似，也是交由线程池维护执行，同时按照 `HTTP` 协议把服务的端口号改为 `80` 。不解释，直接上代码：

```java
public class Server {
    /** 定义服务器的监听端口号 */
    private final int PORT = 80;

    /** 定义单个处理器线程池同时工作线程数目 */
    private final int POOLSIZE = 4;

    /** 定义服务器端的套接字 */
    private ServerSocket serverSocket;

    /** 定义线程池 */
    private ExecutorService executorService;

    /**
     * 创建服务器端套接字并绑定到指定的监听端口以及创建固定大小的线程池
     *
     * @throws IOException IOException
     */
    public Server() throws IOException {
        serverSocket = new ServerSocket(PORT);
        executorService = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors() * POOLSIZE);
    }

    /**
     * 启动服务器端
     *
     * @param args args
     * @throws IOException IOException
     */
    public static void main(String[] args) throws IOException {
        new Server().service();
    }

    /**
     * 等待客户端的request请求
     */
    public void service() {
        Socket socket = null;
        while (true) {
            try {
                socket = serverSocket.accept();
                executorService.execute(new Handler(socket));
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

## Handler 服务器端执行

服务器端对于请求的处理其实是最难的一块，需要解析、拼接报文，根据各种各样不同的情况给出不一样的处理。重中之重是对于 `GET` 请求的处理，因为涉及到资源嵌入的问题。要考虑不同的资源类型对于 `doGet` 得做不同的操作，只有当资源类型为 `text/html` 时才涉及到对图片进行处理。这里我是另外定义了一个 `ImageToBase64` 类，用于图片到 `Base64` 的转换。

```java
private void doGet(String in) throws IOException {
    // 分解GET请求报文
    String[] req = in.split("\\s");
    // 请求的文件相对于服务器根目录的路径
    String path = "";
    // 请求的文件
    File file = null;
    // 文件大小
    long fileSize = 0;
    // 文件类型
    String fileType = "";

    // 请求报文格式不正确 HTTP 400 错误的请求
    if (req.length != 3) {
        String response = "HTTP/1.1 400 Bad Request" + CRLF + CRLF;
        buffer = response.getBytes();
        ostream.write(buffer, 0, response.length());
        ostream.flush();
    } else {
        // 请求报文格式正确
        path = req[1];
        // 将服务器根路径和相对路径拼接得到绝对路径
        path = serverPath + path;
        // 根据绝对路径打开文件
        file = new File(path);
        // 如果文件存在 HTTP 200 成功处理请求
        if (file.exists()) {
            String[] s = path.split("/");
            if (s[s.length - 1].contains("jpg")) {
                fileType = "image/jpeg";
            } else if (s[s.length - 1].contains("htm")) {
                fileType = "text/html";
            } else if (s[s.length - 1].contains("txt")) {
                fileType = "text/plain";
            } else if (s[s.length - 1].contains("png")) {
                fileType = "image/png";
            } else if (s[s.length - 1].contains("JPG")) {
                fileType = "image/JPEG";
            }
            fileSize = file.length();

            // 不用将图片嵌入的情况
            if(fileType != "text/html"){
                // 将响应报文的头部写入
                String response = "HTTP/1.1 200 OK" + CRLF;
                response += "Server: " + "LyyHttpServer/1.1" + CRLF;
                response += "Content-type: " + fileType + CRLF;
                response += "Content-length: " + fileSize + CRLF;
                response += "Content-Location: " + req[1] + CRLF + CRLF;
                buffer = response.getBytes();
                ostream.write(buffer, 0, buffer.length);
                ostream.flush();

                long num = file.length() / buffer_size + 1;
                int j = 1;
                FileInputStream fileIn = new FileInputStream(path);
                while (j <= num) {
                    buffer = new byte[buffer_size];
                    // 从文件读入到缓存数组
                    fileIn.read(buffer);
                    // 从缓存数组写入到报文
                    ostream.write(buffer);
                    ostream.flush();
                    j++;
                }
                fileIn.close();
            }else{
                // 需要将图片嵌入HTML文件
                FileReader reader = new FileReader(file);
                char[] deposit = new char[(int)fileSize];
                while( reader.read(deposit) != -1 ){
                    // 将HTML内容存进字符串
                    String string = new String(deposit,0,deposit.length);

                    // 正则表达式找出img标签src属性
                    List<String> srcList = new ArrayList<String>();
                    //匹配字符串中的img标签
                    Pattern p = Pattern.compile("<(img|IMG)(.*?)(>|></img>|/>)");
                    Matcher matcher = p.matcher(string);
                    boolean hasPic = matcher.find();
                    //判断是否含有图片
                    if(hasPic == true)
                    {
                        //如果含有图片，那么持续进行查找，直到匹配不到
                        while(hasPic)
                        {
                            //获取第二个分组的内容，也就是 (.*?)匹配到的
                            String group = matcher.group(2);
                            //匹配图片的地址
                            Pattern srcText = Pattern.compile("(src|SRC)=(\"|\')(.*?)(\"|\')");
                            Matcher matcher2 = srcText.matcher(group);
                            if( matcher2.find() )
                            {
                                //把获取到的图片地址添加到列表中
                                srcList.add( matcher2.group(3) );
                            }
                            //判断是否还有img标签
                            hasPic = matcher.find();
                        }

                        String tmp="";

                        // 将图片转为base64格式
                        for(String src:srcList){
                            if(src.startsWith("http")){
                                if(src.contains("jpg")){
                                    tmp = ImageToBase64.NetImageToBase64(src,"jpg");
                                }else if(src.contains("png")){
                                    tmp = ImageToBase64.NetImageToBase64(src,"png");
                                }
                                string = string.replace(src,tmp);
                            }else {
                                if(src.contains("jpg")){
                                    tmp = ImageToBase64.ImageToBase64(serverPath+src,"jpg");
                                }else if(src.contains("png")){
                                    tmp = ImageToBase64.ImageToBase64(serverPath+src,"png");
                                }
                                string = string.replace(src,tmp);
                            }
                        }
                    }

                    buffer = string.getBytes();
                    fileSize = buffer.length;

                    // 将响应报文的头部写入
                    String response = "HTTP/1.1 200 OK" + CRLF;
                    response += "Server: " + "LyyHttpServer/1.1" + CRLF;
                    response += "Content-type: " + fileType + CRLF;
                    response += "Content-length: " + fileSize + CRLF;
                    response += "Content-Location: " + req[1] + CRLF + CRLF;
                    buffer = response.getBytes();
                    ostream.write(buffer, 0, buffer.length);
                    ostream.flush();

                    buffer = string.getBytes();
                    ostream.write(buffer,0,string.length());
                    ostream.flush();

                    System.out.println("已将图片嵌入到HTML文档");
                }
            }
        } else {
            // 如果文件不存在 HTTP 404 找不到资源
            String response = "HTTP/1.1 404 NOT FOUND" + CRLF + CRLF;
            buffer = response.getBytes();
            ostream.write(buffer, 0, response.length());
            ostream.flush();
        }
    }
}
```

## ImageToBase64 图片到 Base64 的转换

这里我区分了本地图片和网络图片的两种情况，本地图片需要提前上传到服务器端才能转换，而网络图片直接利用 URL 链接读取图片并进行转换。

网络图片转换为 `Base64`：

```java
public static String NetImageToBase64(String netImagePath,String type) {
    final ByteArrayOutputStream data = new ByteArrayOutputStream();
    String strNetImageToBase64="";
    try {
        // 创建URL
        URL url = new URL(netImagePath);
        final byte[] by = new byte[1024];
        // 创建链接
        final HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        conn.setConnectTimeout(5000);
        InputStream is = conn.getInputStream();
        // 将内容读取内存中
        int len = -1;
        while ((len = is.read(by)) != -1) {
            data.write(by, 0, len);
        }
        // 对字节数组Base64编码
        BASE64Encoder encoder = new BASE64Encoder();
        strNetImageToBase64 = encoder.encode(data.toByteArray());
        // 关闭流
        is.close();
    } catch (IOException e) {
        e.printStackTrace();
    }

    return "data:image/"+type +";base64,"+strNetImageToBase64;
}
```

本地图片转换为 `Base64`：

```java
public static String ImageToBase64(String imgPath,String type) {
    byte[] data = null;
    // 读取图片字节数组
    try {
        InputStream in = new FileInputStream(imgPath);
        data = new byte[in.available()];
        in.read(data);
        in.close();
    } catch (IOException e) {
        e.printStackTrace();
    }
    // 对字节数组Base64编码
    BASE64Encoder encoder = new BASE64Encoder();
    // 返回Base64编码过的字节数组字符串
    return "data:image/"+type+";base64,"+ encoder.encode(Objects.requireNonNull(data));
}
```

到此，基本上一个 WEB 服务器和客户端就完成了。喜欢的话留言鼓励一下叭。:balloon::gift::tada: