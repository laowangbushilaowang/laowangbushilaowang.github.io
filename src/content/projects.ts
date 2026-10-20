import data from "../../content/projects.json";
import type { ProjectItem } from "@/types/content";
import { sortProjects } from "@/lib/project-order";

export const projects = sortProjects(data as ProjectItem[]);
