import { getDb } from "../utils/mongo";

(async () => {
    const db = await getDb();

    const pipeline = [
        { $group: { _id: '$skill', recipes: { $push: '$title' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ];

    const results = await db.collection('recipes').aggregate(pipeline).toArray();
    console.log(results)
    process.exit(0);
})()