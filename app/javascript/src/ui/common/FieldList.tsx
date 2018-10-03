import * as React from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";

interface FieldRow {
  name: string;
  element: JSX.Element;
}
interface Props {
  render: (id: number, index: number) => FieldRow;
  fieldCount?: number;
  disabled?: boolean;
}

interface State {
  idList: number[];
  fieldList: FieldRow[];
}

const minFieldCount = 1;

class FieldList extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    const fieldListSize = props.fieldCount > minFieldCount ? props.fieldCount : minFieldCount;
    const idList = Array(fieldListSize).map((_f, index) => index);

    this.state = {
      idList,
      fieldList: []
    };
  }

  private constructFieldList = () => {
    const { render } = this.props;
    this.setState(state => { fieldList: state.idList.map((id, index) => render(id, index))})
  }

  public componentDidMount() {
    this.constructFieldList();
  }
  public componentDidUpdate(prevProps: Props) {
    const { fieldCount: prevFieldCount } = prevProps;
    const { fieldCount, render } = this.props;

    if (fieldCount !== prevFieldCount) {
      this.setState((prevState) => {
        const newIdList = prevState.idList.slice();
        const idCount = prevState.idList.length;

        for (let i = idCount; i < fieldCount; i++) {
          newIdList.push(i);
        }
        newIdList.splice(fieldCount > minFieldCount ? fieldCount : minFieldCount);

        const fieldList = newIdList.map((id, index) => render(id, index))
        return {
          fieldList,
          idList: newIdList,
        };
      });
    }
  }

  public getFieldList = () => {
    return this.state.fieldList.map(field => field.name);
  }
  private addRow = () => {
    this.setState(state => ({ idList: [...state.idList, state.idList.length]}))
  }

  private removeRows = (ids: number[]) => {
    this.setState(state => ({ idList: state.idList.filter(id => ids.includes(id))}))
  }


  private getRow = (field: FieldRow, index: number): JSX.Element => {
    const { idList } = this.state;
    const removeRow = () => this.removeRows([idList[index]]);

    return (
      <div key={index}>
        <Grid item xs={10}>
          {field.element}
        </Grid>
        <Grid item xs={2}>
          <Button
            color="primary"
            variant="contained"
            disabled={this.props.disabled}
            onClick={removeRow}
          >
            X
          </Button>
        </Grid>
      </div>
    );
  }

  public render(): JSX.Element {
    const { fieldList } = this.state;

    return (
      <>
        {fieldList.map(this.getRow)}
        <Button
          color="primary"
          variant="outlined"
          disabled={this.props.disabled}
          onClick={this.addRow}
        >
          Add Row
        </Button>
      </>
    )

  }
}

export default FieldList;