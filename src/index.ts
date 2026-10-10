#!/usr/bin/env node
import { Command } from "commander";
import pkg from "../package.json" with { type: "json" };

const program = new Command()
  .name("pancake")
  .description("Waffo Pancake developer CLI — initial scaffold; business commands are not implemented.")
  .version(pkg.version);

program.action(() => program.outputHelp());
program.parse();
