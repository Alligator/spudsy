import * as React from 'react';
import styled from 'styled-components';
import { withProps } from '../types';
import * as colours from '../colours';

type Props = {
  title: string,
  width: number,
  children: React.ReactNode,
};

const CardContainer = withProps<{ width: number }>()(styled.div)`
  min-width: ${(props) => props.width + 20}px;
  border-radius: 5px;
  background-color: ${colours.bg1};
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
  margin: 10px;

  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.h2`
  padding: 10px;
  font-weight: normal;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  background-color: ${colours.bg2};
`;

const CardContent = styled.div`
  padding: 10px;
`;

const Card = (props: Props) => {
  return (
    <CardContainer width={props.width}>
      <CardHeader>{props.title}</CardHeader>
      <CardContent>
        {props.children}
      </CardContent>
    </CardContainer>
  );
};

export default Card;