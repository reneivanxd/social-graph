export class UserData {
  public id: number;
  public name: string;

  public get title(): string {
    return this.name;
  }

  public constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}
