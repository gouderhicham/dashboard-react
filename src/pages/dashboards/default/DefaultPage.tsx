import { Fragment } from 'react';
import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/toolbar';

const DefaultPage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading title="Dashboard" />
        </Toolbar>
      </Container>

      <Container>{/* Blank page — add your content here. */}</Container>
    </Fragment>
  );
};

export { DefaultPage };
