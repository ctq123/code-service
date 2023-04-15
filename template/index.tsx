/* eslint-disable consistent-return */
import { useRef, useState } from 'react';
import { Input, Modal, Radio, message, Alert, Button } from 'poizon-design';
import { DownloadOutlined } from '@ant-design/icons';
import ProTable, { ActionType } from '@poizon-design/pro-table';
import { getAndDelRangTime, requestProTable } from '@global/utils';
import * as API from './api';
import * as GAPI from '@/api';
import { useColumns } from './useColumns';
import { getUserInfo, getUserName } from '@global/utils/user';
import { TableListItem } from '@global/types';
import { showExportModal } from '@global/utils/export';

const { TextArea } = Input;
// 商品信息反馈页面
export const GoodsFeedback = () => {
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [remarkModalVisible, setRemarkModalVisible] = useState(false);
  const [resolveVal, setResolveVal] = useState('');
  const [remark, setRemark] = useState('');
  const [row, setRow] = useState<any>({});
  const actionRef: any = useRef<ActionType>();
  const paramRef = useRef<any>(null);

  const handleCancel = () => {
    setResolveModalVisible(false);
    setRemarkModalVisible(false);
  };

  const handleRefresh = () => {
    message.success('操作成功');
    actionRef?.current.reload();
  };

  const handleResolve = () => {
    if (!resolveVal) {
      return message.warning('请先选择问题类型');
    }
    const processUser = getUserName();
    API.handleProcess({
      id: row.id,
      status: resolveVal === '1' ? 2 : 3,
      processUser,
    }).then(() => {
      handleCancel();
      handleRefresh();
    });
  };

  const handleRemark = () => {
    if (!remark) {
      return message.warning('备注不能为空');
    }
    const processUser = getUserName();
    API.handleRemark({ id: row.id, remark, processUser }).then(() => {
      handleCancel();
      handleRefresh();
    });
  };

  const handleCompleteCB = (r: any) => {
    const processUser = getUserName();
    API.handleProcess({ id: r.id, status: 1, processUser }).then(() => {
      handleRefresh();
    });
  };

  const handleExport = () => {
    try {
      const accountInfo = getUserInfo();
      const params = {
        taskType: 9,
        creatorId: accountInfo?.id,
        creatorName: accountInfo?.username,
        exportParam: paramRef.current ? JSON.stringify(paramRef.current) : '',
      };
      GAPI.exportTask(params).then(() => {
        showExportModal({ type: 'export' });
      });
    } catch (e) {
      console.log(e);
    }
  };

  const { columns } = useColumns({
    handleCompleteCB,
    handleResloveCB: (r: any) => {
      setRow(r);
      setResolveVal('');
      setResolveModalVisible(true);
    },
    handleRemarkCB: (r: any) => {
      setRow(r);
      setRemark('');
      setRemarkModalVisible(true);
    },
  });

  return (
    <div className="du-page-layout">
      <ProTable<TableListItem>
        actionRef={actionRef}
        columns={columns}
        // form={{ layout: 'vertical' }}
        request={async (params = {}) => {
          console.log('params', params);
          const newParams: any = {
            ...params,
            pageNum: params.current,
            pageSize: params.pageSize,
          };
          if (params.spuIdList) {
            newParams.spuIdList = params.spuIdList.split(',');
          }
          if (Array.isArray(params.categoryIdList)) {
            newParams.categoryIdList = params.categoryIdList
              .map((item: any) => {
                if (item.length > 2) return item[2];
                return null;
              })
              .filter(Boolean);
          }
          if (params.brandIdList) {
            newParams.brandIdList = params.brandIdList.split(',');
          }
          if (params.brandId) {
            newParams.brandIdList = [params.brandId];
          }
          if (Array.isArray(params.errorLevelTypes) && params.errorLevelTypes.length) {
            const [level1, level2] = params.errorLevelTypes;
            newParams.errorLevel1Type = level1;
            newParams.errorLevel2Type = level2;
          }
          delete newParams.errorLevelTypes;

          getAndDelRangTime(newParams, 'createTime', ['', ''], 'dateRange');
          paramRef.current = newParams;
          console.log('newParams', newParams);
          return requestProTable(API.queryList(newParams));
        }}
        scroll={{
          x: 'max-content',
        }}
        editable={{
          type: 'multiple',
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        dateFormatter="string"
        headerTitle={'商品信息反馈列表'}
        toolBarRender={() => [
          <Button
            key="export"
            type="link"
            style={{ padding: 0 }}
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            导出
          </Button>,
        ]}
      />
      <Modal
        title="不处理问题类型选择"
        visible={resolveModalVisible}
        width={800}
        onOk={handleResolve}
        onCancel={handleCancel}
      >
        <Radio.Group onChange={(e) => setResolveVal(e.target.value)} value={resolveVal}>
          <Radio value={'1'}>商品问题</Radio>
          <Radio value={'2'}>非商品问题</Radio>
        </Radio.Group>
        <Alert
          message="说明"
          style={{ marginTop: 20 }}
          description={
            <div>
              商品问题：如货号、标题、发售信息、图片等跟商品相关问题 ； <br />
              非商品问题：如咨询物流信息，售前售后服务等需客服协助处理的问题；
            </div>
          }
          type="warning"
        />
      </Modal>
      <Modal
        title="添加备注"
        visible={remarkModalVisible}
        onOk={handleRemark}
        onCancel={handleCancel}
      >
        <TextArea
          showCount
          maxLength={200}
          rows={4}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default GoodsFeedback;
