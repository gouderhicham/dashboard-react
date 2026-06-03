import { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/toolbar';

const BlankPage = () => {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading />
        </Toolbar>
      </Container>

      <Container>
        <div className="card">
          <div className="card-body flex items-center justify-center text-sm text-gray-600 py-20">
            <FormattedMessage id="PAGE.TEST_PLACEHOLDER" />
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export { BlankPage };
