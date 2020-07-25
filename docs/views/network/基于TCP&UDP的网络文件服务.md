---
title: 基于 TCP & UDP 的网络文件服务
date: 2020-07-24
tags:
 - java
 - socket
categories: 
 - network
---

基于 `java` 、 `socket` 、 `TCP` 和 `UDP` 实现一个简易的网络文件服务程序，包含服务器端 `FileServer` 和客户端 `FileClient` 。服务器启动后，开启 `TCP：2021 port` ，`UDP：2020 port` ，其中，`TCP` 连接负责与用户交互，`UDP` 负责传送文件。客户端启动后，连接指定服务器的 `TCP：2021 port` ，成功后，服务器端回复信息： “ 客户端 IP 地址：客户端端口号 > 连接成功 ” 。服务器端支持多用户并发访问，不用考虑文件过大或 `UDP` 传输不可靠的问题。

<!-- more -->

## socket 简介

网络中的进程是通过 `socket` 来通信的。 `socket` 起源于 `Unix` ，而 `Unix` / `Linux` 基本哲学之一就是 “ 一切皆文件 ” ，都可以用 “ 打开 open > 读写 write / read > 关闭  close ” 模式来操作。 `socket` 就是该模式的一个实现， `socket` 即是一种特殊的文件， `socket` 函数就是对其进行的操作。

## FileClient 客户端

首先新建客户端类 `FileClient` 。

```java
public class FileClient {

    ...

}
```
在 `FileClient` 的静态变量里面定义好 `TCP` 和 `UDP` 的端口号以及一次性传输字节数， `socket` 使用 `TCP` 连接与用户交互， `datagramSocket` 使用 `UDP` 连接传送文件。

``` java
/** TCP连接端口 */
private static final int TCP_PORT = 2021;
/** UDP端口 */
private static final int UDP_PORT = 2020;
/** 一次传送文件的字节数 */
private static final int SEND_SIZE = 1024;

private Socket socket;
private DatagramSocket datagramSocket;
```

 `FileClient` 的构造函数。最初的 `host` 是在 `java` 的命令行运行参数里面给出的，但是后来又有要求是手动输入 `host` ，于是用 `Scanner` 不断循环读取，并初始化 `socket` 

``` java
private FileClient() throws UnknownHostException, IOException {
    System.out.println("Please Input HOST");
    Scanner hostScanner = new Scanner(System.in);
    while (hostScanner.next() == null){
        System.out.println("Please Input HOST");
    }
    String HOST = hostScanner.nextLine();
    System.out.println("OK");

    socket = new Socket(HOST, TCP_PORT);
}
```
定义客户端向服务器端发送消息的相关操作，用 `PrintWriter` 输出流向服务器写入命令，用 `BufferedReader` 输入流将服务器的返回信息接收。相关命令包括 `ls` 、 `cd` 、 `get` 、 `bye` 等。需要注意的是整个过程需要用 `try...catch` 包裹住来处理 IO 操作可能抛出的错误，另外，在 IO 操作结束后要关闭相应的输入输出流和 `socket` 连接。当运行到  `getFile()` 时，开启 `UDP` 连接进行文件传输。

```java {27}
 private void send() {
    try {
        // 客户端输出流，向服务器发消息（https://blog.csdn.net/m0_37574389/article/details/84024689）
        BufferedWriter bw = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
        // 客户端输入流，接收服务器消息
        BufferedReader br = new BufferedReader(new InputStreamReader(socket.getInputStream()));
        // 装饰输出流，自动刷新（https://blog.csdn.net/qq_38977097/article/details/80967896）
        PrintWriter pw = new PrintWriter(bw, true);

        // 输出服务器返回连接成功的消息
        System.out.println(br.readLine());

        // 接受用户信息
        Scanner in = new Scanner(System.in);
        String cmd;
        while ((cmd = in.next()) != null) {
            // 发送给服务器端
            pw.println(cmd);
            if (cmd.equals("cd") || cmd.equals("get")) {
                String dir = in.next();
                pw.println(dir);
                // 下载文件
                if (cmd.equals("get")) {
                    long fileLength = Long.parseLong(br.readLine());
                    if (fileLength != -1) {
                        System.out.println("文件大小为：" + fileLength);
                        getFile(dir, fileLength);
                    } else {
                        System.out.println("Unknown file");
                    }
                }
            }
            String msg = null;
            while ((msg = br.readLine()) != null) {
                if (msg.equals("Cmd End")) {
                    break;
                }
                // 输出服务器返回的消息
                System.out.println(msg);
            }

            if (cmd.equals("bye")) {
                System.out.println("断开连接，客户端运行完毕");
                break;
            }
        }
        in.close();
        br.close();
        bw.close();
        pw.close();
    } catch (IOException e) {
        e.printStackTrace();
    } finally {
        if (socket != null) {
            try {
                // 断开连接
                socket.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

当客户端发出 `get` 命令的时候可以利用请求的文件路径打开 `UDP` 连接进行文件的下载，此时本地储存文件的路径由用户的输入来确定。需要注意的一点是 `datagramPacket` 每次只传输规定大小的字节数组数据，这个值在一开始就由 `SEND_SIZE` 确定了。如果是一份大文件的话需要将文件切分成固定大小来分别传输。

```java
private void getFile(String fileName, long fileLength) throws IOException {
    DatagramPacket datagramPacket = new DatagramPacket(new byte[SEND_SIZE], SEND_SIZE);
    // UDP连接
    datagramSocket = new DatagramSocket(UDP_PORT);
    byte[] recInfo = new byte[SEND_SIZE];
    //自定义文件存储位置
    Scanner scanner1 = new Scanner(System.in);
    //先输入盘
    System.out.println("盘>>：");
    String pan = scanner1.nextLine();
    Scanner scanner2 = new Scanner(System.in);
    //再输入文件夹
    System.out.println("文件夹>>");
    String file = scanner2.nextLine();
    String root = pan + ":\\" + file + "\\";
    //判断文件名是否存在
    File rootFile = new File(root);
    if (!rootFile.exists()) {
        System.out.println("Directory not exist!");
        datagramSocket.close();
        return;
    }
    if (!rootFile.isDirectory()) {
        System.out.println("This is not a directory!");
        datagramSocket.close();
        return;
    }
    System.out.println("开始接收文件：" + root);
    FileOutputStream fos = new FileOutputStream(new File((root) + fileName));
    int count = (int) (fileLength / SEND_SIZE) + ((fileLength % SEND_SIZE) == 0 ? 0 : 1);

    while ((count--) > 0) {
        // 接收文件信息
        datagramSocket.receive(datagramPacket);
        recInfo = datagramPacket.getData();
        fos.write(recInfo, 0, datagramPacket.getLength());
        fos.flush();
    }
    System.out.println("文件接收完毕");
    datagramSocket.close();
    fos.close();
}
```

运行客户端

```java
public static void main(String[] args) throws UnknownHostException, IOException {
    new FileClient().send();
}
```

## FileServer 服务器端

同样的，先新建 `FileServer` 类。

```java
public class FileServer {

    ...

}
```

这里为了实现多个客户端同时访问，用到了 `ExecutorService` 线程池。这里 `POOL_SIZE` 是单个处理器同时工作的线程数目，根据当前的硬件来动态地获取可以使用的处理器的数量。

::: details
`ExecutorService` 是 `java` 提供的线程池，也就是说，每次我们需要使用线程的时候，可以通过 `ExecutorService` 获得线程。它可以有效控制最大并发线程数，提高系统资源的使用率，同时避免过多资源竞争，避免堵塞，同时提供定时执行、定期执行、单线程、并发数控制等功能，也不用使用 `TimerTask` 了。
:::

```java
/** TCP连接端口 */
private static final int TCP_PORT = 2021;
/**  单个处理器线程池同时工作线程数目 */
private static final int POOL_SIZE = 10;

private ServerSocket serverSocket;
private ExecutorService executorService;
```

```java
private FileServer() throws IOException {
    // 创建服务器端套接字
    serverSocket = new ServerSocket(TCP_PORT);
    // 创建线程池
    // Runtime的availableProcessors()方法返回当前系统可用处理器的数目
    // 由JVM根据系统的情况来决定线程的数量
    executorService = Executors.newFixedThreadPool(Runtime.getRuntime().availableProcessors() * POOL_SIZE);
    System.out.println("服务器启动，线程池创建完成");
}
```

`service()` 方法是对于服务器端具体的运行操作，这里是用到了线程池的 `execute()` 方法，这个方法是以 `java.lang.Runnable` 对象作为参数，所以另外定义一个新的类 `Handler` 来实现 `Runnable` 接口，其中定义的 `run()` 方法是线程执行的时候的具体操作。用 `Handler` 类作为 `execute()` 方法的参数从而实现服务器端的执行。

```java
private void service() {
    Socket socket = null;
    while (true) {
        try {
            // 等待用户连接
            socket = serverSocket.accept();
            // 把执行交给线程池来维护
            executorService.execute(new Handler(socket));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

运行服务器端，服务器端应该要先于客户端运行。

```java
public static void main(String[] args) throws IOException {
    new FileServer().service();
}
```


## Handler 服务器端执行

`Handler` 类实现 `Runnable` 接口。

```java
public class Handler implements Runnable {
    /** 连接地址 */
    private static final String HOST = "127.0.0.1";
    /** UDP端口 */
    private static final int UDP_PORT = 2020;
    /** 一次传送文件的字节数 */
    private static final int SEND_SIZE = 1024;

    private Socket socket;
    private DatagramSocket datagramSocket;
    private SocketAddress socketAddress;

    BufferedReader br;
    BufferedWriter bw;
    PrintWriter pw;

    private final String rootPath = "your root path";
    public static String currentPath = "your current path";

    ...

}
```

构造函数，接收服务器端套接字作为参数。

```java
public Handler(Socket socket) {
    this.socket = socket;
}
```

输入输出流进行初始化。

```java
public void initStream() throws IOException {
    br = new BufferedReader(new InputStreamReader(socket.getInputStream()));
    bw = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
    pw = new PrintWriter(bw, true);
}
```

接下来，便是最最最最最重要的 `run()` 函数实现，超级超级长的一个函数。主要还是对客户端发来的各种命令进行相应的处理。

```java
@Override
public void run() {
    System.out.println("Please Input HOST");
    Scanner hostScanner = new Scanner(System.in);
    while (hostScanner.next() == null){
        System.out.println("Please Input HOST");
    }
    String HOST = hostScanner.nextLine();
    System.out.println("OK");

    try {
        // 服务器信息
        System.out.println(socket.getInetAddress() + ":" + socket.getPort() + ">连接成功");
        // 初始化输入输出流对象
        initStream();
        // 向客户端发送连接成功信息
        pw.println(socket.getInetAddress() + ":" + socket.getPort() + ">连接成功");

        String info;
        while (null != (info = br.readLine())) {
            // 退出
            if (info.equals("bye")) {
                break;
            } else {
                switch (info) {
                    //服务器返回当前目录文件列表
                    case "ls":
                        listDir(currentPath);
                        break;
                    //进入指定目录
                    case "cd":
                        String dir = null;
                        if (null != (dir = br.readLine())) {
                            moveDir(dir);
                        } else {
                            pw.println("please input a direction after cd");
                        }
                        break;
                    //返回上级目录
                    case "cd..":
                        backDir();
                        break;
                    //通过UDP下载指定文件
                    case "get":
                        String fileName = br.readLine();
                        sendFile(fileName);
                        break;
                    default:
                        pw.println("unknown cmd");
                }
                // 用于标识目前的指令结束，以帮助跳出Client的输出循环
                pw.println("Cmd End");
            }
        }
    } catch (IOException | InterruptedException e) {
        e.printStackTrace();
    } finally {
        if (null != socket) {
            try {
                br.close();
                bw.close();
                pw.close();
                socket.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

向客户端发送文件，仍然是需要注意文件以字节数组的形式分成小块发送。

```java
private void sendFile(String fileName) throws SocketException, IOException, InterruptedException {
    // 文件不存在
    if (!isFileExist(fileName)) {
        pw.println(-1);
        return;
    }
    //得到文件路径
    File file = new File(currentPath + "\\" + fileName);
    pw.println(file.length());
    // UDP
    datagramSocket = new DatagramSocket();
    socketAddress = new InetSocketAddress(HOST, UDP_PORT);
    DatagramPacket datagramPacket;

    byte[] sendInfo = new byte[SEND_SIZE];
    int size = 0;
    datagramPacket = new DatagramPacket(sendInfo, sendInfo.length, socketAddress);
    BufferedInputStream bufferedInputStream = new BufferedInputStream(new FileInputStream(file));

    while ((size = bufferedInputStream.read(sendInfo)) > 0) {
        datagramPacket.setData(sendInfo);
        datagramSocket.send(datagramPacket);
        sendInfo = new byte[SEND_SIZE];
    }

    datagramSocket.close();
}
```

到此，基本上一个基于 `TCP` 和 `UDP` 的网络文件服务就完成了。喜欢的话留言鼓励一下叭。:balloon::gift::tada:



