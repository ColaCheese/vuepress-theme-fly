---
title: RMI 分布式消息系统
date: 2020-07-20
tags:
 - java
 - rmi
categories: 
 - distributed
---

使用RMI建立一个分布式消息系统。该系统需实现用户注册、查看所有已注册用户信息、给其他用户留言，以及查看其它用户给自己的留言。包括 `register()` 、 `showusers()` 、 `checkmessages()` 、 `leavemessage()` 方法。

<!-- more -->

这个思路其实和 RMI 分布式议程服务一样，只不过换了个要实现的功能而已。在这里我们仍然是定义一个接口用来定义操作对象的方法，实现一个客户端获取远程对象，然后再在服务器端实现远程对象并注册。

## HelloInterface 接口

这里的 `HelloInterface` 添加了一个 `echo()` 方法，用来在客户端输出当前可以执行的命令作为提示。

```java
public interface HelloInterface extends Remote {

    /** 所有方法必须抛出RemoteException */
    public String echo(String msg) throws RemoteException;

    /**
     * 注册用户
     *
     * @param username 用户名
     * @param password 密码
     * @return 注册是否成功
     * @throws RemoteException RemoteException
     */
    public String register(String username, String password) throws RemoteException;

    /**
     * 显示所有注册用户
     *
     * @return 所有注册用户名列表
     * @throws RemoteException RemoteException
     */
    public String showusers() throws RemoteException;

    /**
     * 显示用户所有留言
     *
     * @param username 用户名
     * @param password 密码
     * @return 用户所有留言列表
     * @throws RemoteException RemoteException
     */
    public String checkmessages(String username, String password) throws RemoteException;

    /**
     * 留言
     *
     * @param username     用户名
     * @param password     密码
     * @param receiverName 接收者
     * @param messageText  留言信息
     * @return 留言返回消息
     * @throws RemoteException RemoteException
     */
    public String leavemessage(String username, String password, String receiverName, String messageText) 
    throws RemoteException;
}
```

## Bean 数据封装

这里用 `Message` 类和 `User` 类分别表示消息系统里面的两种数据对象。要注意的是和之前一样，对象要实现序列化的接口。

```java
public class Message implements Serializable {
    /** 评论者的名字 */
    private String commenter;
    /** 评论的日期 */
    private Date commentDate;
    /** 评论的内容 */
    private String contents;

    /**
     * 构造函数初始化Message对象
     */
    public Message(String commenter, Date commentDate, String contents) {
        super();
        this.commenter = commenter;
        this.commentDate = commentDate;
        this.contents = contents;
    }

    ... 各种方法

}
```

```java
public class User implements Serializable {
    /** 用户名 */
    private String name;
    /** 密码 */
    private String password;
    /** 用户的消息列表 */
    private List<Message> messageList = new ArrayList<Message>();

    /**
     * 构造函数初始化User对象，有用户名、密码、消息列表三个属性
     *
     * @param name        用户名
     * @param password    密码
     * @param messageList 消息列表
     */
    public User(String name, String password, List<Message> messageList) {
        super();
        this.name = name;
        this.password = password;
        this.messageList = messageList;
    }

    /**
     * 构造函数初始化User对象，有用户名、密码两个属性
     *
     * @param name     用户名
     * @param password 密码
     */
    public User(String name, String password) {
        super();
        this.name = name;
        this.password = password;
    }

    /**
     * 构造函数初始化User对象，有用户名一个属性
     *
     * @param name 用户名
     */
    public User(String name) {
        super();
        this.name = name;
    }

    ... 各种方法

}
```

## HelloClient RMI 客户端

`RMI` 客户端也和之前实现的 `RMI` 客户端类似，不过在获取远程对象之前添加了对于客户端、服务器端以及端口号是否错误的判断。只有在输入正确的情况下才会去请求远程对象。

```java
if (!clientName.equals("HelloClient")) {
    System.out.println("客户端错误");
} else if (!serverName.equals("localhost")) {
    System.out.println("服务器错误");
} else if (portNumber != 1099) {
    System.out.println("端口号错误");
} else {

    // 通过查找获得远程对象
    HelloInterface hello = (HelloInterface) Naming.lookup("Hello");

    // 调用远程方法
    System.out.println(hello.echo("good morning"));

    // 存储用户输入信息
    String info = null;
    while ((info = in.readLine()) != null) {

        ...远程对象的具体操作

    }
}

```

## Hello 远程对象实现

```java
public class Hello extends UnicastRemoteObject implements HelloInterface {

    /**
     * 服务器和客户端这个字段必须保持一致才能进行反序列化
     * JAVA序列化的机制是通过判断类的serialVersionUID来验证的版本一致的
     * 在进行反序列化时JVM会把传来的字节流中的serialVersionUID于本地相应实体类的serialVersionUID进行比较
     * 如果相同说明是一致的，可以进行反序列化，否则会出现反序列化版本一致的异常
     */
    private static final long serialVersionUID = 1L;

    /** 定义状态 */
    private String status = "0000";

    /** 定义用户列表 */
    private List<User> userList = new ArrayList<User>();

    /**
     * 必须定义构造方法，即使是默认构造方法，也必须把它明确地写出来，因为它必须抛出出RemoteException异常
     */
    public Hello() throws RemoteException {

    }

    /** 远程接口方法的实现 */

    ...

}
```

## HelloServer RMI 服务器端

```java
public class HelloServer {
    /**
     * 启动 RMI 注册服务并进行对象注册
     */
    public static void main(String[] args) {
        try {

            // 启动RMI注册服务，指定端口为1099　（1099为默认端口）
            // 注册远程对象,向客户端提供远程对象服务。
            // 远程对象是在远程服务上创建的，无法确切地知道远程服务器上的对象的名称，
            // 但是,将远程对象注册到RMI Registry之后,
            // 客户端就可以通过RMI Registry请求到该远程服务对象的stub，
            // 利用stub代理就可以访问远程服务对象了。
            LocateRegistry.createRegistry(1099);

            // 创建远程对象的一个或多个实例，下面是hello对象
            // 可以用不同名字注册不同的实例
            HelloInterface hello = new Hello();

            // 把hello注册到RMI注册服务器上，命名为Hello
            // 如果要把hello实例注册到另一台启动了RMI注册服务的机器上，Naming.rebind("//192.168.1.105:1099/Hello",hello)
            Naming.rebind("Hello", hello);

            // 打印服务器就绪信息
            System.out.println("Hello Server is ready.");

        } catch (Exception e) {
            System.out.println("Hello Server failed: " + e);
        }
    }
}
```

基本上结束啦，用 `RMI` 实现分布式消息系统，这里写得很简略，具体更多的细节可以参考 RMI 分布式议程服务。:balloon::gift::tada: