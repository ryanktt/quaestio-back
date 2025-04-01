/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

export const defaultPaginationValues = { page: 1, limit: 20 };

@InputType()
export class PaginationInput {
    @Field(() => Int, { defaultValue: 1 })
    page!: number;

    @Field(() => Int, { defaultValue: 20 })
    limit!: number;
}

interface ClassType<T = unknown> {
    new(...args: unknown[]): T;
}

export function PaginatedResponse<T>(TClass: ClassType<T>) {
    @ObjectType({ isAbstract: true })
    abstract class PaginatedResponseClass {
        @Field(() => [TClass])
        results!: T[];

        @Field(() => Int)
        currentPage!: number;

        @Field(() => Int)
        totalPageCount!: number;

        @Field(() => Int)
        totalResultCount!: number;

        @Field()
        hasNextPage!: boolean;
    }

    return PaginatedResponseClass;
}
