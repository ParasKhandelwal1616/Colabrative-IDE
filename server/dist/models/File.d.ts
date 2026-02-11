import mongoose from "mongoose";
export declare const File: mongoose.Model<{
    name: string;
    projectId: mongoose.Types.ObjectId;
    content: string;
    language: string;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    name: string;
    projectId: mongoose.Types.ObjectId;
    content: string;
    language: string;
}, {}, mongoose.DefaultSchemaOptions> & {
    name: string;
    projectId: mongoose.Types.ObjectId;
    content: string;
    language: string;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    name: string;
    projectId: mongoose.Types.ObjectId;
    content: string;
    language: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    name: string;
    projectId: mongoose.Types.ObjectId;
    content: string;
    language: string;
}>, {}, mongoose.ResolveSchemaOptions<mongoose.DefaultSchemaOptions>> & mongoose.FlatRecord<{
    name: string;
    projectId: mongoose.Types.ObjectId;
    content: string;
    language: string;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
//# sourceMappingURL=File.d.ts.map