import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NoticiasModule } from './modules/noticias/noticias.module';
import { SemanaEstrategicaModule } from './modules/semana-estrategica/semana-estrategica.module';
import { Noticia } from './modules/noticias/entities/noticia.entity';
import { Lixeira } from './modules/noticias/entities/lixeira.entity';
import { SemanaEstrategica } from './modules/semana-estrategica/entities/semana-estrategica.entity';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PortaisModule } from './modules/portais/portais.module';
import { Portal } from './modules/portais/entities/portais.entity';
import { NoticiasPostagemModule } from './modules/noticias-postagem/noticias-postagem.module';
import { NoticiaPostagem } from './modules/noticias-postagem/entities/noticia-postagem.entity';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { User } from './modules/user/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl: string = configService.get<string>('DATABASE_URL')!;
        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [Noticia, Lixeira, SemanaEstrategica, Portal, NoticiaPostagem, User], // Adiciona User
          autoLoadEntities: true, // Carrega automaticamente entidades de forFeature
          synchronize: false,
          logging: true,
        };
      },
      inject: [ConfigService],
    }),
    NoticiasModule,
    SemanaEstrategicaModule,
    DashboardModule,
    PortaisModule,
    NoticiasPostagemModule,
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}