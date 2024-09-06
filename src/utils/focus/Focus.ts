import type { ExItemFocus } from "src/utils/focus/ExItemFocus";
import type { ExObjectFocus } from "src/utils/focus/ExObjectFocus";
import type { ExprFocus } from "src/utils/focus/ExprFocus";
import type { NavFocus } from "src/utils/focus/NavFocus";
import type { ProjectComponentWindowFocus } from "src/utils/focus/ProjectComponentWindowFocus";

export type Focus = ExItemFocus | ExObjectFocus | ExprFocus | NavFocus | ProjectComponentWindowFocus | ViewActionsFocus | EditorFocus | ComponentFocus;