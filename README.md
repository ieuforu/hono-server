# 安装依赖

```shell

bun install
```

> 数据库表是 通过 Drizzle ORM 的 migration 管理的，所以如果别人拉下代码或者新建环境，必须执行 migration 才能创建数据库表，否则 CRUD 接口会报错（表不存在）。

# 生成 migration（如果是第一次建表或修改 schema）

```shell
bunx drizzle-kit generate --name init

```

# 执行 migration

```shell

bunx drizzle-kit migrate

```

或者直接运行 package.json 配置好的脚本：`bun migrate`
