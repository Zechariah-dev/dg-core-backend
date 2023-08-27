import { Module } from "@nestjs/common";
import { ProductsModule } from "./products/products.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CategoriesModule } from "./categories/categories.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { ForumsModule } from "./forums/forums.module";
import { AdminModule } from "./admin/admin.module";
import { FavoritesModule } from "./favorites/favorites.module";
import { GatewayModule } from "./gateway/gateway.module";
import { ConversationsModule } from "./conversations/conversations.module";
import { MessagesModule } from "./messages/messages.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { StoresModule } from "./stores/stores.module";

@Module({
  imports: [
    ProductsModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ReviewsModule,
    ForumsModule,
    AdminModule,
    FavoritesModule,
    GatewayModule,
    ConversationsModule,
    MessagesModule,
    NotificationsModule,
    StoresModule
  ],
})
export class V1Module {}
