import React from "react";
import renderer from "react-test-renderer";

import { Checkbox } from "../src/features/list/components/Checkbox";

test("Renders correctly unchecked", () => {
  const tree = renderer.create(<Checkbox checked={false} />).toJSON();
  expect(tree).toMatchSnapshot();
});

test("Renders correctly checked", () => {
  const tree = renderer.create(<Checkbox checked={true} />).toJSON();
  expect(tree).toMatchSnapshot();
});
