import { sqliteTable, text, real, integer, uniqueIndex } from "drizzle-orm/sqlite-core";

export const cards = sqliteTable("cards", {
  id:                 text("id").primaryKey(),
  front:              text("front").notNull(),
  pinyin:             text("pinyin"),
  definition:         text("definition").notNull(),
  example:            text("example"),
  examplePinyin:      text("example_pinyin"),
  exampleTranslation: text("example_translation"),
  sourceArticle:      text("source_article"),

  // FSRS scheduling state
  due:           text("due").notNull(),
  stability:     real("stability").notNull().default(0),
  difficulty:    real("difficulty").notNull().default(0),
  elapsedDays:   integer("elapsed_days").notNull().default(0),
  scheduledDays: integer("scheduled_days").notNull().default(0),
  reps:          integer("reps").notNull().default(0),
  lapses:        integer("lapses").notNull().default(0),
  state:         integer("state").notNull().default(0),
  learningSteps: integer("learning_steps").notNull().default(0),
  lastReview:    text("last_review"),

  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
}, (table) => [
  uniqueIndex("idx_cards_front_source").on(table.front, table.sourceArticle),
]);
