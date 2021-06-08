import { italic, bold, red, green, blue } from "https://deno.land/std@0.97.0/fmt/colors.ts";

interface Task {
    name: string;
    state: TaskState;
    description: string;
}

interface Call<Type> {
    [call: string]: Type;
}

type TaskState = "completed" | "uncompleted";

enum Commands {
    exit,
    show,
    clean,
    create,
    remove,
    restart,
    complete,
}

async function main() {
    console.log(green("Welcome back"));
    while (true) {
        await handler(
            Commands[prompt(bold("What are you going to do?:"), "exit") as keyof typeof Commands]
        );
    }
}

async function handler(response: number) {
    switch (response) {
        case Commands.exit: {
            Deno.exit();
        }
        case Commands.show: {
            showTask();
            break;
        }
        case Commands.clean: {
            console.clear();
            break;
        }
        case Commands.create: {
            create();
            await update();
            break;
        }
        case Commands.remove: {
            remove(prompt(green("type the name of the task")) as string);
            await update();
            break;
        }
        case Commands.restart: {
            restart();
            break;
        }
        case Commands.complete: {
            complete(prompt(green("Enter the name of the task you completed")) as string);
            break;
        }
    }
}

const showTask = () =>
    Object.keys(tasks).forEach((taskName) => {
        const { name, description, state } = tasks[taskName];
        console.log(`\n< ${green(name)} [${colorStateTask(state)}] >`);
        console.log(italic(description), "\n");
    });

const colorStateTask = (state: TaskState) => (state === "completed" ? blue(state) : red(state));

const remove = (name: string) => delete tasks[name];

const create = () => {
    const name = prompt(green("type the name of the task")) as string;
    const description = prompt(green("enter the task description")) as string;
    validate(prompt(bold(green("Are you sure"))) as string)
        ? (tasks[name] = {
              name,
              description,
              state: "uncompleted",
          })
        : console.log(red("task canceled"));
};

const validate = (text: string): boolean => /(yes|y|sure|ok)/.test(text);

const restart = () =>
    validate(prompt(bold(green("You are sure to want to delete all tasks"))) as string)
        ? Object.keys(tasks).forEach((name) => remove(name))
        : console.log(italic(green("Canceled")));

const complete = (name: string) => (tasks[name].state = "completed");

const update = async () => await Deno.writeTextFile("tasks.json", JSON.stringify(tasks));

const checkJson = () =>
    Deno.readTextFile("tasks.json").catch(() => Deno.writeTextFile("tasks.json", "{}"));

await checkJson();

const tasks: Call<Task> = JSON.parse(await Deno.readTextFile("tasks.json"));

await main();
