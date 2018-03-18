import * as React from 'react';
import styled from 'react-emotion';
import * as colours from '../colours';

type Props = {
  title: React.ReactNode,
  width: number,
  children: React.ReactNode,
};

const CardContainer = styled<{ width: number }, 'div'>('div')`
  min-width: ${(props) => props.width + 20}px;
  max-width: ${(props) => props.width + 20}px;
  border-radius: 5px;
  background-color: ${colours.bg1};
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
  margin: 10px;

  display: flex;
  flex-direction: column;
`;

const CardHeader = styled('h2')`
  padding: 10px;
  font-weight: normal;
  margin-bottom: 0;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  background-color: ${colours.bg2};
`;

const CardContent = styled('div')`
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