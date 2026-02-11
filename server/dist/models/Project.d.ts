import mongoose from "mongoose";
export declare const Project: mongoose.Model<{
    name: string;
    ownerId: string;
    collaborators: mongoose.Types.DocumentArray<{
        role: "editor" | "viewer";
        userId?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        role: "editor" | "viewer";
        userId?: string | null;
    }> & {
        role: "editor" | "viewer";
        userId?: string | null;
    }>;
    createdAt: NativeDate;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    name: string;
    ownerId: string;
    collaborators: mongoose.Types.DocumentArray<{
        role: "editor" | "viewer";
        userId?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        role: "editor" | "viewer";
        userId?: string | null;
    }> & {
        role: "editor" | "viewer";
        userId?: string | null;
    }>;
    createdAt: NativeDate;
}, {}, mongoose.DefaultSchemaOptions> & {
    name: string;
    ownerId: string;
    collaborators: mongoose.Types.DocumentArray<{
        role: "editor" | "viewer";
        userId?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        role: "editor" | "viewer";
        userId?: string | null;
    }> & {
        role: "editor" | "viewer";
        userId?: string | null;
    }>;
    createdAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    name: string;
    ownerId: string;
    collaborators: mongoose.Types.DocumentArray<{
        role: "editor" | "viewer";
        userId?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        role: "editor" | "viewer";
        userId?: string | null;
    }> & {
        role: "editor" | "viewer";
        userId?: string | null;
    }>;
    createdAt: NativeDate;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    name: string;
    ownerId: string;
    collaborators: mongoose.Types.DocumentArray<{
        role: "editor" | "viewer";
        userId?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        role: "editor" | "viewer";
        userId?: string | null;
    }> & {
        role: "editor" | "viewer";
        userId?: string | null;
    }>;
    createdAt: NativeDate;
}>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<{
    name: string;
    ownerId: string;
    collaborators: mongoose.Types.DocumentArray<{
        role: "editor" | "viewer";
        userId?: string | null;
    }, mongoose.Types.Subdocument<mongoose.mongo.BSON.ObjectId, any, {
        role: "editor" | "viewer";
        userId?: string | null;
    }> & {
        role: "editor" | "viewer";
        userId?: string | null;
    }>;
    createdAt: NativeDate;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=Project.d.ts.map