import { Migration } from '@mikro-orm/migrations';

export class Migration20260524164959 extends Migration {

  override up(): void | Promise<void> {
    this.addSql(`create table "wallet" ("id" uuid not null, "user_id" varchar(255) not null, "balance" bigint not null default '0', "created_at" timestamptz not null, "updated_at" timestamptz not null, primary key ("id"));`);
    this.addSql(`alter table "wallet" add constraint "wallet_user_id_unique" unique ("user_id");`);
  }

}
