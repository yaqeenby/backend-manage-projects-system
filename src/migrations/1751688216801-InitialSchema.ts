import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1751688216801 implements MigrationInterface {
    name = 'InitialSchema1751688216801'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notification_entitytype_enum" AS ENUM('Task', 'Project', 'Department', 'Organization', 'User')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_action_enum" AS ENUM('Create', 'Update', 'View', 'Delete')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_targettype_enum" AS ENUM('Task', 'Project', 'Department', 'Organization', 'User')`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" character varying, "updated_by" character varying, "entityType" "public"."notification_entitytype_enum" NOT NULL, "entityId" character varying NOT NULL, "action" "public"."notification_action_enum" NOT NULL, "targetType" "public"."notification_targettype_enum" NOT NULL, "targetId" character varying NOT NULL, "isProcessed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification_users_user" ("notificationId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_7606b7d7b70299cea4521b61989" PRIMARY KEY ("notificationId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cc471803e22568445b772a45ea" ON "notification_users_user" ("notificationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_9c0c1c8c13cf53180e087e7f36" ON "notification_users_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "notification_users_user" ADD CONSTRAINT "FK_cc471803e22568445b772a45ea0" FOREIGN KEY ("notificationId") REFERENCES "notification"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "notification_users_user" ADD CONSTRAINT "FK_9c0c1c8c13cf53180e087e7f364" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_users_user" DROP CONSTRAINT "FK_9c0c1c8c13cf53180e087e7f364"`);
        await queryRunner.query(`ALTER TABLE "notification_users_user" DROP CONSTRAINT "FK_cc471803e22568445b772a45ea0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9c0c1c8c13cf53180e087e7f36"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cc471803e22568445b772a45ea"`);
        await queryRunner.query(`DROP TABLE "notification_users_user"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TYPE "public"."notification_targettype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_action_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_entitytype_enum"`);
    }

}
