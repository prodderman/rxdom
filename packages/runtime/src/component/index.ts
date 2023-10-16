export function createComponent(Comp: (props: any) => any, props: any): any {
  return Comp(props);
}
