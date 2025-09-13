'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Guest } from '@/types/api';
import { IconApple, IconMessage, IconUserQuestion } from '@tabler/icons-react';
import { CheckCircle, Clock, TrashIcon, X } from 'lucide-react';
import { z } from 'zod';
import { Badge } from '../ui/badge';
import { CopyButton } from '../ui/shadcn-io/copy-button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export const schema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  hashCode: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  partySize: z.number(),
  dietaryRestrictions: z.string(),
  specialRequests: z.string(),
  createdAt: z.string(),
  rsvpConfirmation: z.object({
    id: z.string(),
    isAttending: z.boolean(),
    confirmedPartySize: z.number(),
    message: z.string(),
    confirmedAt: z.string(),
  }),
});

const getStatusBadge = (guest: Guest) => {
  if (!guest.rsvpConfirmation) {
    return (
      <Badge
        variant="outline"
        className="bg-yellow-50 text-yellow-700 border-yellow-200 pointer-events-none"
      >
        <Clock className="w-3 h-3 mr-1" />
        En attente
      </Badge>
    );
  }

  if (guest.rsvpConfirmation.isAttending) {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200 pointer-events-none">
        <CheckCircle className="w-3 h-3 mr-1" />
        Confirmé ({guest.rsvpConfirmation.confirmedPartySize})
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="bg-red-50 text-red-700 border-red-200 pointer-events-none"
    >
      <X className="w-3 h-3 mr-1" />
      Décliné
    </Badge>
  );
};

const CustomTooltip = ({ Icon, text }: { Icon: any; text: string }) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent className="font-sans">
        <p>{text}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const columns: (
  handleDeleteGuest: (guestId: string) => void,
) => ColumnDef<z.infer<typeof schema>>[] = (handleDeleteGuest) => [
  {
    accessorKey: 'firstName',
    header: 'Utilisateur',
    cell: ({ row }) => {
      return (
        <div>
          {row.original.firstName} {row.original.lastName}
        </div>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <div className="">{row.original.email}</div>,
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Téléphone',
    cell: ({ row }) => <div className="">{row.original.phoneNumber}</div>,
  },
  {
    accessorKey: 'hashCode',
    header: 'Code',
    cell: ({ row }) => (
      <CopyButton
        content={row.original.hashCode}
        size="sm"
        className="w-full"
        variant="outline"
      />
    ),
  },
  {
    accessorKey: 'Statut',
    header: 'Status',
    cell: ({ row }) => getStatusBadge(row.original),
  },
  {
    accessorKey: 'partySize',
    header: 'Groupe',
    cell: ({ row }) => (
      <div className="">
        {row.original.rsvpConfirmation?.confirmedPartySize || 0} /{' '}
        {row.original.partySize}
      </div>
    ),
  },
  {
    accessorKey: 'date',
    header: 'Ajouté le',
    cell: ({ row }) => (
      <div className="">
        {new Date(row.original.createdAt).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: 'rsvpDate',
    header: 'RSVP le',
    cell: ({ row }) => (
      <div className="">
        {row.original.rsvpConfirmation?.confirmedAt &&
          new Date(
            row.original.rsvpConfirmation?.confirmedAt,
          ).toLocaleDateString()}
      </div>
    ),
  },
  {
    accessorKey: 'dietaryRestrictions',
    header: 'Autres informations',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.dietaryRestrictions && (
          <CustomTooltip
            Icon={IconApple}
            text={row.original.dietaryRestrictions}
          />
        )}
        {row.original.specialRequests && (
          <CustomTooltip
            Icon={IconUserQuestion}
            text={row.original.specialRequests}
          />
        )}
        {row.original.rsvpConfirmation?.message && (
          <CustomTooltip
            Icon={IconMessage}
            text={row.original.rsvpConfirmation.message}
          />
        )}
      </div>
    ),
  },

  {
    id: 'actions',
    cell: ({ row }) => (
      <Button
        variant="ghost"
        onClick={() => handleDeleteGuest(row.original.id)}
        className="text-destructive "
      >
        <TrashIcon />
      </Button>
    ),
  },
];

export function GuestsTable({
  data,
  handleDeleteGuest,
}: {
  data: Guest[];
  handleDeleteGuest: (guestId: string) => void;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns: columns(handleDeleteGuest),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full ">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          Page {table.getState().pagination.pageIndex + 1} sur{' '}
          {table.getPageCount()}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédente
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivante
          </Button>
        </div>
      </div>
    </div>
  );
}
