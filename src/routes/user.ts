import { Hono } from 'hono';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = new Hono();

// 校验函数
function validateUserInput(body: any, partial = false) {
    const errors: string[] = [];

    if (!partial || body.name !== undefined) {
        if (typeof body.name !== 'string' || !body.name.trim()) {
            errors.push('Invalid name');
        }
    }

    if (!partial || body.age !== undefined) {
        if (typeof body.age !== 'number' || body.age <= 0) {
            errors.push('Invalid age');
        }
    }

    return errors;
}

// 增 (Create)
router.post("/users", async (c) => {
    const body = await c.req.json();
    const errors = validateUserInput(body);
    if (errors.length) {
        return c.json({ success: false, errors }, 400);
    }

    // 插入数据
    const result = await db.insert(users).values({ name: body.name, age: body.age });
    const insertId = result.insertId;

    // 查询完整对象
    const [inserted] = await db.select().from(users).where(eq(users.id, insertId));

    return c.json({ success: true, user: inserted });
});

// 删 (Delete)
router.delete('/users/:id', async (c) => {
    const id = Number(c.req.param("id"));

    // 先查询是否存在
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) {
        return c.json({ success: false, message: 'User not found' }, 404);
    }

    // 执行删除
    await db.delete(users).where(eq(users.id, id));

    return c.json({ success: true, deleted: user });
});

// 改 (Update / PATCH)
router.patch('/users/:id', async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();

    const errors = validateUserInput(body, true);
    if (errors.length) {
        return c.json({ success: false, errors }, 400);
    }

    const updateData: Partial<{ name: string; age: number }> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.age !== undefined) updateData.age = body.age;

    if (Object.keys(updateData).length === 0) {
        return c.json({ success: false, message: 'No fields to update' }, 400);
    }

    // 先更新
    const result = await db.update(users).set(updateData).where(eq(users.id, id));

    // 再查询完整对象
    const [updated] = await db.select().from(users).where(eq(users.id, id));
    if (!updated) {
        return c.json({ success: false, message: 'User not found' }, 404);
    }

    return c.json({ success: true, user: updated });
});

// 查 (Read)
router.get("/users", async (c) => {
    const allUsers = await db.select().from(users);
    return c.json({ success: true, users: allUsers });
});

router.get("/users/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const [user] = await db.select().from(users).where(eq(users.id, id));

    if (!user) {
        return c.json({ success: false, message: 'User not found' }, 404);
    }

    return c.json({ success: true, user });
});

export default router;
