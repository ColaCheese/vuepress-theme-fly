---
title: RMI 分布式议程服务
date: 2020-07-21
tags:
 - java
 - rmi
categories: 
 - distributed
---

创建一个分布式议程共享服务。不同的用户可以使用这个共享议程服务执行查询、添加和删除会议的操作。服务器支持会议的登记和清除等功能。议程共享服务包括以下功能：用户注册、添加会议、查询会议、删除会议、清除会议。

<!-- more -->

## RMI 远程方法调用

我们先来看一下子，:eyes: `RMI` 是个啥。`RMI` ，即远程方法调用（Remote Method Invocation），一种用于实现远程过程调用 `RPC` （Remote procedure call）的 `java` API， 能直接传输序列化后的 `java` 对象和分布式垃圾收集。它的实现依赖于 `java` 虚拟机 `JVM` ，因此它仅支持从一个 `JVM` 到另一个 `JVM` 的调用。:see_no_evil:

还是不太懂（其实是忘了:persevere:），不过比较重要的一点是 `RMI` 要依赖于 `JVM` 虚拟机，也就是除了 `java` ，也只有 `kotlin`、`scala` 等 `JVM` 语言才能实现 `RMI` 。

`RMI` 有以下优点：
- 提供了简单而直接的途径。这些对象可以是新的 `java` 对象，也可以是围绕现有 API 的简单的 `java` 包装程序。 `java` 体现了 “ 编写一次就能在任何地方运行的模式。而 `RMI` 可将 `java` 模式进行扩展，使之可在任何地方运行 ” 。
- 因为 `RMI` 是以 `java` 为核心的，所以，它将 `java` 的安全性和可移植性等强大功能带给了分布式计算。
- `RMI` 还可利用标准 `JDBC` 包与现有的关系数据库连接。 `RMI` / `JNI` 和 `RMI` / `JDBC` 相结合，可帮助你利用 `RMI` 与目前使用非 `java` 语言的现有服务器进行通信，而且在需要时可扩展 `java` 在这些服务器上的使用。

既然 `RMI` 这么强，那么我们怎么用呢？

`RMI` 由3个部分构成，第一个是 `RMI Registry`（ `JDK` 提供的一个可以独立运行的程序，在 bin 目录下）；第二个是 server 端的程序，对外提供远程对象；第三个是 client 端的程序，想要调用远程对象的方法。

1. 先启动 `RMI Rregistry` 服务，启动时可以指定服务监听的端口，也可以使用默认的端口（1099）。
2. server 端在本地先实例化一个提供服务的实现类，然后通过 `RMI` 提供的 `Naming` / `Context` / `Registry` 等类的 bind 或 rebind 方法将刚才实例化好的实现类注册到 `RMI Registry` 上并对外暴露一个名称。
3. client 端通过本地的接口和一个已知的名称（即 `RMI Registry` 暴露出的名称）再使用 `RMI` 提供的 `Naming` / `Context` / `Registry` 等类的 lookup 方法从 `RMI Service` 那拿到实现类。这样虽然本地没有这个类的实现类，但所有的方法都在接口里了，便可以实现远程调用对象的方法了。

## Interface 接口

远程接口必须扩展接口 `java.rmi.Remote` 所有参数和返回类型必须序列化（因为要网络传输），任意远程对象都必须实现此接口，只有远程接口中指定的方法可以被调用。我们在这个接口里面定义需要调用的方法。

```java
public interface Interface extends Remote {
    /** 所有方法必须抛出RemoteException */

    /**
     * 用户注册
     *
     * @param username 用户名
     * @param password 密码
     * @return 代表是否创建成功
     * @throws RemoteException RemoteException
     */
    public int register(String username, String password) throws RemoteException;

    /**
     * 添加新会议
     *
     * @param meeting 会议对象
     * @param username 用户名
     * @param password 密码
     * @return 代表是否添加成功
     * @throws RemoteException RemoteException
     */
    public int add(Meeting meeting, String username, String password) throws RemoteException;

    /**
     * 查询相应时间段内是否有会议
     *
     * @param username 用户名
     * @param password 密码
     * @param start 开始时间
     * @param end 结束时间
     * @return 代表是否有会议
     * @throws RemoteException RemoteException
     */
    public ArrayList<Meeting> query(String username, String password, Date start, Date end) throws RemoteException;

    /**
     * 删除用户发起的某一个会议
     *
     * @param username 用户名
     * @param password 密码
     * @param meetingId 会议编号
     * @return 代表删除是否成功
     * @throws RemoteException RemoteException
     */
    public int delete(String username, String password, int meetingId) throws RemoteException;

    /**
     * 清除用户发起的所有会议
     *
     * @param username 用户名
     * @param password 密码
     * @return 代表清除是否成功
     * @throws RemoteException RemoteException
     */
    public int clear(String username, String password) throws RemoteException;
}
```

## Bean 数据封装

这个分布式议程中有两种数据，一个是 User ，一个是 Meeting ，我们分别用两个两个类来表示，并把相应的属性、方法封装在对应的类中，方便数据模型的传输。要注意的是对象要实现序列化接口，因为对象的序列化就是为了数据传输，在代码里是对象格式，而在传输的时候不可能还保持这对象的样子。当两个进程在进行远程通信时，彼此可以发送各种类型的数据。无论是何种类型的数据，都会以二进制序列的形式在网络上传送。发送方需要把这个 `java` 对象转换为字节序列，才能在网络上传送；接收方则需要把字节序列再恢复为 `java` 对象。

::: tip
序列化的思想是 “ 冻结 ” 对象状态，然后写到磁盘或者在网络中传输（转成 byte [ ] ），反序列化的思想是“解冻”对象状态，重新获得可用的 `java` 对象。
:::

```java
public class Meeting implements Serializable {
    /** Meeting的编号 */
    private int meetingId;
    /** Meeting的开始时间 */
    private Date start;
    /** Meeting的结束时间 */
    private Date end;
    /** Meeting的标题 */
    private String title;
    /** Meeting的发起者 */
    private String sponser;
    /** Meeting的其它参与者 */
    private ArrayList<String> otherUser = new ArrayList<String>();

    /**
     * 构造函数对Meeting对象进行初始化
     */
    public Meeting() {
        super();
    }

    /**
     * 构造函数对Meeting对象进行初始化
     */
    public Meeting(int meetingId, Date start, Date end, String title, String sponser, ArrayList<String> otherUser) {
        super();
        this.meetingId = meetingId;
        this.start = start;
        this.end = end;
        this.title = title;
        this.sponser = sponser;
        this.otherUser = otherUser;
    }

    ... 各种方法

}

```

```java
public class User implements Serializable {
    /** User的用户名 */
    private String username;
    /** User的密码 */
    private String password;
    /** User参与的Meeting列表 */
    private List<Meeting> meetings = new ArrayList<Meeting>();

    /**
     * 构造函数对User对象进行初始化
     */
    public User(String username, String password) {
        super();
        this.username = username;
        this.password = password;
    }

    ... 各种方法

}

```

##  RMIClient RMI 客户端

客户端通过接口访问远程名字对象

```java
// 访问远程的meet对象
Interface meet = (Interface) Naming.lookup("Meet");
```

接下来就是根据控制台的输入，执行相应的命令去修改远程名字对象。这里是通过对外暴露的名称 `meet` 来实现的，而相关的方法我们已经在接口里面定义好了，只要正确地调用就行了。

```java
BufferedReader keyboard = new BufferedReader(new InputStreamReader(System.in));
String request = keyboard.readLine();

String[] reqs = request.split(" ");
```

根据具体的命令，对 `meet` 做相应的操作，实现增、删、改、查之类的功能。

```java
if (reqs[0].equals("register")) {

    if (reqs.length == 3) {
        int i = meet.register(reqs[1], reqs[2]);

        // i==1注册失败
        if (i == -1) {
            System.out.println("repeat username, register failed");
        } else {
            System.out.println("successfully !");
        }

        System.out.println("RMI Menu:");
        System.out.println("register [username] [password]:");
        System.out.println("add [username] [password] [otherusername] [start] [end] [title]:");
        System.out.println("query [username] [password] [start] [end]:");
        System.out.println("delete [username] [password] [meetingid]");
        System.out.println("clear [username] [password]");
        System.out.println("please input option:");
    }else {
        System.out.println("wrong cmd");
    }

} else if (reqs[0].equals("add")) {

    ...

} else if (reqs[0].equals("query")) {

    ...

}

...各种命令的情况


```

## RemoteMeeting 远程对象实现

远程对象需要继承 `UnicastRemoteObject` 类，如果没有继承 `UnicastRemoteObject` 类的对象，同样可以 `bind` 到 `Registry` ，但 `lookup` 出来了对象却是远程对象经过序列化，然后到客户端反序列化出来的新的对象，后续的方法调用与远程对象再无关系。我们需要的是对于远程对象存根的调用，远程对象本体永远在服务器端。

```java

public class RemoteMeeting extends UnicastRemoteObject implements Interface {

    /**
     * 服务器和客户端这个字段必须保持一致才能进行反序列化
     * JAVA序列化的机制是通过判断类的serialVersionUID来验证的版本一致的
     * 在进行反序列化时JVM会把传来的字节流中的serialVersionUID于本地相应实体类的serialVersionUID进行比较
     * 如果相同说明是一致的，可以进行反序列化，否则会出现反序列化版本一致的异常
     */
    private static final long serialVersionUID = 1L;
    private ArrayList<User> users = new ArrayList<User>();
    private ArrayList<Meeting> meetings = new ArrayList<Meeting>();

    /**
     * 必须定义构造方法，即使是默认构造方法，也必须把它明确地写出来，因为它必须抛出RemoteException异常
     */
    public RemoteMeeting() throws RemoteException {

    }

    /** 远程接口方法的实现 */

    ...

}
```

## RMIServer RMI 服务器端

先启动 `RMI` 注册服务，然后将实例化的对象注册到RMI服务器上去。

```java
public class RMIServer {

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

            // 创建远程对象的一个或多个实例，下面是meet对象
            // 可以用不同名字注册不同的实例
            Interface meet = new RemoteMeeting();

            // 把meet注册到RMI注册服务器上，命名为Meet
            // 如果要把meet实例注册到另一台启动了RMI注册服务的机器上，Naming.rebind("//192.168.1.105:1099/Meet",meet)
            Naming.rebind("Meet", meet);

            System.out.println("Meet Server is ready.");
        } catch (Exception e) {
            System.out.println("Meet Server failed: " + e);
        }
    }
}
```

到此，基本上一个 RMI 分布式议程服务就完成了。喜欢的话留言鼓励一下叭。:balloon::gift::tada:
